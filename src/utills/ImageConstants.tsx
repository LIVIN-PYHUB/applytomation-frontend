import LoginImg from "../assets/img/login.jpg"

export {
    LoginImg,
}

interface PageLoaderProps {
  className?: string; // Specify that className is a string and optional
}
export const PageLoader: React.FC<PageLoaderProps> = ({ className }) => (
  <svg
    className={className}
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="40" cy="40" r="36" stroke="#0370F2" strokeWidth="4" />
  </svg>
);
