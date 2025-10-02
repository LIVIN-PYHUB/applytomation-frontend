import { Suspense } from "react";
import type { ComponentType } from "react";
import Loader from "./Loader";

const Loadable = <P extends object>(Component: ComponentType<P>) => (props: P) => {
  return (
    <Suspense fallback={<Loader />}>
      <Component {...props} />
    </Suspense>
  );
};

export default Loadable;
