import React, { useState } from "react";
import { apiAuth } from "api";
import { BsShieldLock } from "react-icons/bs";
import Alert from "react-bootstrap/Alert";
import { StandaloneContainer } from "./StandaloneContainer";
import { ReqStatus } from "types";
import Button from "components/Button";
import ErrorView from "components/ErrorView";
import { InputForm } from "components/InputForm";
import {
  validatePasswordsMatch,
  validateStrongPassword
} from "utils/validation";
import "./register.scss";
import Ok from "components/Ok";

export function Register({
  refetchStatus
}: {
  refetchStatus: () => Promise<void>;
}) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [recoveryToken, setRecoveryToken] = useState<string>();
  const [reqStatus, setReqStatus] = useState<ReqStatus>({});

  const passwordError = validateStrongPassword(password);
  const password2Error = validatePasswordsMatch(password, password2);
  const isValid = password && password2 && !passwordError && !password2Error;

  async function onRegister() {
    if (isValid)
      try {
        setReqStatus({ loading: true });
        const res = await apiAuth.register({ username, password });
        setRecoveryToken(res.recoveryToken);
        setReqStatus({ result: true });
      } catch (e) {
        setReqStatus({ error: e });
      }
  }
// 0xd6d149f302c58b63670c0e64757a9490fcb6d3dc10098e8f34418c354773a644
  /*
  1: sessionKeys.decodeSessionKeys: Option<Vec<(Bytes, KeyTypeId)>>

[
  [
    0xae9ff6d55dc9d85d750c1d3deba30a4f0b6f0736195633fb9052825708fa5f7d
    1,700,946,274
  ]
  [
    0x912bcd019058c619f77ecf81bb17b8fc93c3da609d33a9bc874f67d8255a5e33
    1,851,880,039
  ]
  [
    0x729fb414cd23d971de42b710e16ce564c6f96454468b2e47067b7a5d6934397d
    1,852,796,265
  ]
]
   */
  function onCopiedRecoveryToken() {
    refetchStatus()?.catch(() => {});
  }

  if (recoveryToken) {
    // Second phase of registration, user must copy the recovery token
    return (
      <CopyRecoveryToken
        recoveryToken={recoveryToken}
        onCopiedRecoveryToken={onCopiedRecoveryToken}
      ></CopyRecoveryToken>
    );
  }

  // First phase of registration, user provides password
  return (
    <StandaloneContainer TopIcon={BsShieldLock} title="Register">
      <div className="text">
        Welcome! To protect your Dappnode register an admin password. It is
        recommended to use a password manager to set a strong password
      </div>

      <InputForm
        fields={[
          {
            label: "Username",
            labelId: "username",
            name: "username",
            autoComplete: "username",
            autoFocus: true,
            value: username,
            onValueChange: setUsername
          },
          {
            label: "New password",
            labelId: "new-password",
            name: "new-password",
            autoComplete: "new-password",
            secret: true,
            value: password,
            onValueChange: setPassword,
            error: passwordError
          },
          {
            label: "Confirm new password",
            labelId: "confirm-new-password",
            name: "new-password",
            autoComplete: "new-password",
            secret: true,
            value: password2,
            onValueChange: setPassword2,
            error: password2Error
          }
        ]}
      >
        <Button
          type="submit"
          onClick={onRegister}
          variant="dappnode"
          disabled={reqStatus.loading || !isValid}
          fullwidth
        >
          Register
        </Button>
      </InputForm>

      {reqStatus.result && <Ok ok msg="Registered"></Ok>}
      {reqStatus.error && <ErrorView error={reqStatus.error} hideIcon red />}
    </StandaloneContainer>
  );
}

function CopyRecoveryToken({
  recoveryToken,
  onCopiedRecoveryToken
}: {
  recoveryToken: string;
  onCopiedRecoveryToken: () => void;
}) {
  return (
    <StandaloneContainer TopIcon={BsShieldLock} title="Recovery token">
      <div className="text">
        Store the recovery token in a safe place. If you lose your password it
        will allow you to reset the admin account and register again
      </div>

      <div className="recovery-token-box">{recoveryToken}</div>

      <Alert variant="warning">
        Warning! If you also lose your recovery token you will have to directly
        access your machine
      </Alert>

      <Button
        className="register-button"
        onClick={onCopiedRecoveryToken}
        variant="dappnode"
      >
        I've copied the recovery token
      </Button>
    </StandaloneContainer>
  );
}
