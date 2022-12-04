import { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "../../socket-context";
import { updateCode } from "../../socket-context/EventEmitters";

export const CodingArea = () => {
  const [code, onCodeChange] = useState("");
  const { code: updatedCode } = useContext(SocketContext);

  const onChange = useCallback((e) => {
    onCodeChange(e.target.value);
    updateCode(e.target.value);
  }, []);

  useEffect(() => {
    onCodeChange(updatedCode);
  }, [updatedCode]);

  return (
    <textarea
      style={{ height: "100%", width: "50%", margin: "0.5rem" }}
      onChange={onChange}
      value={code}
    ></textarea>
  );
};
