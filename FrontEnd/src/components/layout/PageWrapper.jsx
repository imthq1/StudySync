import "../../styles/components/layout/PageWrapper.scss";

export default function PageWrapper({ children }) {
  return (
    <div className="page-wrapper">
      <div className="page-wrapper__inner">
        {children}
      </div>
    </div>
  );
}
