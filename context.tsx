import { createContext, useContext } from "react";

export const RequestContext = createContext({});
export const useRequestContext = () => useContext(RequestContext);
