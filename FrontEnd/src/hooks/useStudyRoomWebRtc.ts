import { useCallback, useEffect, useRef, useState } from 'react'
import type { RoomUserSummary, StudyRoomWebRtcSignal, StudyRoomWebRtcSignalRequest } from '../types/study-room'

type CameraStatus = 'idle' | 'requesting' | 'enabled' | 'denied' | 'unavailable' | 'error'

type PeerState = {
  connection: RTCPeerConnection
  ignoreOffer: boolean
  isSettingRemoteAnswerPending: boolean
  makingOffer: boolean
  pendingCandidates: RTCIceCandidateInit[]
}

type UseStudyRoomWebRtcOptions = {
  currentUserId?: number
  isConnected: boolean
  members: RoomUserSummary[]
  sendSignal: (signal: StudyRoomWebRtcSignalRequest) => boolean
}

const EMPTY_SIGNAL_FIELDS = {
  sdp: null,
  candidate: null,
  sdpMid: null,
  sdpMLineIndex: null,
  usernameFragment: null,
} as const

export function useStudyRoomWebRtc({ currentUserId, isConnected, members, sendSignal }: UseStudyRoomWebRtcOptions) {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle')
  const [cameraError, setCameraError] = useState('')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Record<number, MediaStream>>({})
  const [cameraUserIds, setCameraUserIds] = useState<number[]>([])
  const peersRef = useRef(new Map<number, PeerState>())
  const cameraRequestRef = useRef(0)
  const localStreamRef = useRef<MediaStream | null>(null)
  const cameraUsersRef = useRef(new Set<number>())
  const knownUsersRef = useRef(new Set<number>())
  const isConnectedRef = useRef(isConnected)
  const membersRef = useRef(members)
  const sendSignalRef = useRef(sendSignal)

  membersRef.current = members
  isConnectedRef.current = isConnected
  sendSignalRef.current = sendSignal

  const publishCameraState = useCallback((enabled: boolean) => {
    return sendSignalRef.current({
      signalType: 'CAMERA_STATE',
      targetUserId: null,
      ...EMPTY_SIGNAL_FIELDS,
      cameraEnabled: enabled,
    })
  }, [])

  const removeRemoteStream = useCallback((userId: number) => {
    setRemoteStreams((current) => {
      if (!(userId in current)) return current
      const next = { ...current }
      delete next[userId]
      return next
    })
  }, [])

  const closePeer = useCallback((userId: number) => {
    const peer = peersRef.current.get(userId)
    if (peer) {
      peer.connection.onicecandidate = null
      peer.connection.ontrack = null
      peer.connection.onnegotiationneeded = null
      peer.connection.onconnectionstatechange = null
      peer.connection.close()
      peersRef.current.delete(userId)
    }
    removeRemoteStream(userId)
  }, [removeRemoteStream])

  const closeAllPeers = useCallback(() => {
    for (const userId of peersRef.current.keys()) closePeer(userId)
    setRemoteStreams({})
  }, [closePeer])

  const createPeer = useCallback((remoteUserId: number) => {
    const existing = peersRef.current.get(remoteUserId)
    if (existing) return existing

    const connection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    const localVideoTrack = localStreamRef.current?.getVideoTracks()[0]
    const transceiver = connection.addTransceiver('video', {
      direction: localVideoTrack ? 'sendrecv' : 'recvonly',
    })
    if (localVideoTrack) void transceiver.sender.replaceTrack(localVideoTrack)

    const peer: PeerState = {
      connection,
      ignoreOffer: false,
      isSettingRemoteAnswerPending: false,
      makingOffer: false,
      pendingCandidates: [],
    }
    peersRef.current.set(remoteUserId, peer)

    connection.onicecandidate = (event) => {
      if (!event.candidate) return
      const candidate = event.candidate.toJSON()
      sendSignalRef.current({
        signalType: 'ICE_CANDIDATE',
        targetUserId: remoteUserId,
        sdp: null,
        candidate: candidate.candidate ?? null,
        sdpMid: candidate.sdpMid ?? null,
        sdpMLineIndex: candidate.sdpMLineIndex ?? null,
        usernameFragment: candidate.usernameFragment ?? null,
        cameraEnabled: null,
      })
    }

    connection.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track])
      setRemoteStreams((current) => ({ ...current, [remoteUserId]: stream }))
    }

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'failed' || connection.connectionState === 'closed') {
        closePeer(remoteUserId)
      }
    }

    connection.onnegotiationneeded = async () => {
      try {
        peer.makingOffer = true
        const offer = await connection.createOffer()
        if (connection.signalingState !== 'stable') return
        await connection.setLocalDescription(offer)
        sendSignalRef.current({
          signalType: 'OFFER',
          targetUserId: remoteUserId,
          sdp: connection.localDescription?.sdp ?? null,
          candidate: null,
          sdpMid: null,
          sdpMLineIndex: null,
          usernameFragment: null,
          cameraEnabled: null,
        })
      } catch {
        closePeer(remoteUserId)
      } finally {
        peer.makingOffer = false
      }
    }

    return peer
  }, [closePeer])

  const connectToEligibleMembers = useCallback(() => {
    if (!currentUserId) return
    const localCameraEnabled = Boolean(localStreamRef.current)
    for (const member of membersRef.current) {
      if (currentUserId >= member.id) continue
      if (localCameraEnabled || cameraUsersRef.current.has(member.id)) createPeer(member.id)
    }
  }, [createPeer, currentUserId])

  const handleSignal = useCallback(async (signal: StudyRoomWebRtcSignal) => {
    if (!currentUserId || signal.fromUserId === currentUserId) return

    if (signal.signalType === 'CAMERA_STATE') {
      const wasKnown = knownUsersRef.current.has(signal.fromUserId)
      knownUsersRef.current.add(signal.fromUserId)

      if (signal.cameraEnabled) cameraUsersRef.current.add(signal.fromUserId)
      else cameraUsersRef.current.delete(signal.fromUserId)
      setCameraUserIds([...cameraUsersRef.current])

      if (!signal.cameraEnabled) removeRemoteStream(signal.fromUserId)
      if (!wasKnown && isConnectedRef.current) publishCameraState(Boolean(localStreamRef.current))

      if (currentUserId < signal.fromUserId && (Boolean(localStreamRef.current) || Boolean(signal.cameraEnabled))) {
        createPeer(signal.fromUserId)
      } else if (!localStreamRef.current && !signal.cameraEnabled) {
        closePeer(signal.fromUserId)
      }
      return
    }

    if (signal.targetUserId !== currentUserId) return
    const peer = createPeer(signal.fromUserId)
    const connection = peer.connection

    try {
      if (signal.signalType === 'ICE_CANDIDATE') {
        if (!signal.candidate || peer.ignoreOffer) return
        const candidate: RTCIceCandidateInit = {
          candidate: signal.candidate,
          sdpMid: signal.sdpMid,
          sdpMLineIndex: signal.sdpMLineIndex,
          usernameFragment: signal.usernameFragment ?? undefined,
        }
        if (connection.remoteDescription) await connection.addIceCandidate(candidate)
        else peer.pendingCandidates.push(candidate)
        return
      }

      if (!signal.sdp) return
      const description: RTCSessionDescriptionInit = {
        type: signal.signalType === 'OFFER' ? 'offer' : 'answer',
        sdp: signal.sdp,
      }
      const readyForOffer = !peer.makingOffer
        && (connection.signalingState === 'stable' || peer.isSettingRemoteAnswerPending)
      const offerCollision = description.type === 'offer' && !readyForOffer
      const isPolite = currentUserId > signal.fromUserId
      peer.ignoreOffer = !isPolite && offerCollision
      if (peer.ignoreOffer) return

      peer.isSettingRemoteAnswerPending = description.type === 'answer'
      await connection.setRemoteDescription(description)
      peer.isSettingRemoteAnswerPending = false

      for (const candidate of peer.pendingCandidates.splice(0)) {
        await connection.addIceCandidate(candidate)
      }

      if (description.type === 'offer') {
        const answer = await connection.createAnswer()
        await connection.setLocalDescription(answer)
        sendSignalRef.current({
          signalType: 'ANSWER',
          targetUserId: signal.fromUserId,
          sdp: connection.localDescription?.sdp ?? null,
          candidate: null,
          sdpMid: null,
          sdpMLineIndex: null,
          usernameFragment: null,
          cameraEnabled: null,
        })
      }
    } catch {
      closePeer(signal.fromUserId)
    }
  }, [closePeer, createPeer, currentUserId, publishCameraState, removeRemoteStream])

  const stopLocalMedia = useCallback(() => {
    cameraRequestRef.current += 1
    const stream = localStreamRef.current
    localStreamRef.current = null
    stream?.getTracks().forEach((track) => track.stop())
    setLocalStream(null)
    setCameraStatus('idle')
    setCameraError('')
    closeAllPeers()
  }, [closeAllPeers])

  const shutdownMedia = useCallback(() => {
    stopLocalMedia()
    cameraUsersRef.current.clear()
    knownUsersRef.current.clear()
    setCameraUserIds([])
  }, [stopLocalMedia])

  const disableCamera = useCallback(() => {
    stopLocalMedia()
    if (isConnectedRef.current) publishCameraState(false)
    window.setTimeout(connectToEligibleMembers, 0)
  }, [connectToEligibleMembers, publishCameraState, stopLocalMedia])

  const enableCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unavailable')
      setCameraError('Trình duyệt này không hỗ trợ truy cập camera.')
      return
    }

    setCameraStatus('requesting')
    setCameraError('')
    const requestId = ++cameraRequestRef.current
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: 'user' },
      })
      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) throw new Error('No video track')
      videoTrack.onended = () => {
        if (localStreamRef.current === stream) disableCamera()
      }
      localStreamRef.current = stream
      setLocalStream(stream)
      setCameraStatus('enabled')
      closeAllPeers()
      if (isConnectedRef.current) publishCameraState(true)
      window.setTimeout(connectToEligibleMembers, 0)
    } catch (error) {
      if (requestId !== cameraRequestRef.current) return
      const denied = error instanceof DOMException && error.name === 'NotAllowedError'
      setCameraStatus(denied ? 'denied' : 'error')
      setCameraError(denied
        ? 'Bạn cần cho phép truy cập camera để sử dụng tính năng này.'
        : 'Không thể mở camera. Hãy kiểm tra thiết bị và thử lại.')
    }
  }, [closeAllPeers, connectToEligibleMembers, disableCamera, publishCameraState])

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) disableCamera()
    else void enableCamera()
  }, [disableCamera, enableCamera])

  const removeMember = useCallback((userId: number) => {
    knownUsersRef.current.delete(userId)
    cameraUsersRef.current.delete(userId)
    setCameraUserIds([...cameraUsersRef.current])
    closePeer(userId)
  }, [closePeer])

  useEffect(() => {
    if (!isConnected || !currentUserId) return
    knownUsersRef.current.clear()
    publishCameraState(Boolean(localStreamRef.current))
    connectToEligibleMembers()
  }, [connectToEligibleMembers, currentUserId, isConnected, members, publishCameraState])

  useEffect(() => {
    const memberIds = new Set(members.map((member) => member.id))
    for (const userId of peersRef.current.keys()) {
      if (!memberIds.has(userId)) removeMember(userId)
    }
  }, [members, removeMember])

  useEffect(() => () => {
    cameraRequestRef.current += 1
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null
    for (const peer of peersRef.current.values()) peer.connection.close()
    peersRef.current.clear()
  }, [])

  return {
    cameraError,
    cameraStatus,
    cameraUserIds,
    handleSignal,
    localStream,
    remoteStreams,
    removeMember,
    shutdownMedia,
    toggleCamera,
  }
}
