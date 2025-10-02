import { PageLoader } from "../utills/ImageConstants";


interface LoaderProps {
}
const Loader:React.FC<LoaderProps> = ({}) => (
  <>
    <div className="loader-wrap">
      <div className="loader-content">
        <PageLoader className="loader-spinner" />
      </div>
    </div>
  </>
);

export default Loader;
