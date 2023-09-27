import { useEffect, useState } from "react";
import { Button, TextInput } from "react-native";
import { Text, View } from "./components/Themed";
import { RequestContext } from "./context";

const RequestProvider = ({ children }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [enableSpoofingChallenge, setEnableSpoofingChallenge] = useState(true);
  return (
    <RequestContext.Provider
      value={{
        name,
        setName,
        amount,
        setAmount,
        enableSpoofingChallenge,
        setEnableSpoofingChallenge,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export default RequestProvider;
