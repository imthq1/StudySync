# AWS S3 setup for StudySync

## 1. Create the bucket

1. Open AWS Console > S3 > Create bucket.
2. Choose the same region used by the application, for example `ap-southeast-1`.
3. Use a globally unique name, for example `studysync-documents-123456789012`.
4. Keep **Block all public access** enabled.
5. Enable default encryption with SSE-S3 or SSE-KMS.

No public bucket policy or S3 website hosting is required. The API returns a temporary presigned download URL.

## 2. Create IAM permissions

Attach this policy to the IAM user used for local development, or preferably to the IAM role of the production service. Replace the bucket name first.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StudySyncDocumentObjects",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::studysync-documents-123456789012/documents/*"
    }
  ]
}
```

If SSE-KMS is selected, also grant the role the required `kms:Encrypt`, `kms:Decrypt`, and `kms:GenerateDataKey` permissions for that KMS key.

## 3. Configure credentials

For local development, choose one method:

```bash
aws configure
```

Or set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in the untracked `.env` file. When using temporary STS credentials, also set `AWS_SESSION_TOKEN`. Do not commit access keys.

For ECS, EC2, Elastic Beanstalk, or Lambda, attach the IAM role to the workload and omit static access keys. The AWS SDK default credential provider will load the role automatically.

## 4. Configure StudySync

Create `.env` from `.env.example` and set at least:

```dotenv
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=studysync-documents-123456789012
AWS_S3_KEY_PREFIX=documents
AWS_S3_PRESIGNED_URL_MINUTES=15
```

When running from IntelliJ or Maven, use the backend directory as the working directory so Spring Boot can find `.env`. Alternatively, configure these values as environment variables in the IDE run configuration.

If upload fails, check the backend log and the API message:

- `S3 bucket is not configured`: `AWS_S3_BUCKET` was not loaded.
- `Cannot connect to S3`: credentials are missing/invalid or the network/region is wrong.
- `AccessDenied`: the IAM principal does not have `s3:PutObject` for the configured bucket prefix.
- `NoSuchBucket`: the bucket name is wrong.
- `AuthorizationHeaderMalformed` or `PermanentRedirect`: `AWS_REGION` does not match the bucket region.

## 5. Call the API

The endpoint requires the existing bearer token authentication.

```bash
curl -X POST "http://localhost:8080/api/v1/posts/upload" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=Distributed systems notes" \
  -F "tags=backend,aws" \
  -F "file=@./notes.pdf"
```

Supported extensions are `pdf`, `ppt`, `pptx`, `doc`, `docx`, `png`, `jpg`, `jpeg`, `gif`, and `webp`. The current maximum file size is 20 MB.

The database stores an object key such as `documents/<uuid>.pdf`. API responses expose that object through a temporary `fileUrl`; the default lifetime is 15 minutes.
