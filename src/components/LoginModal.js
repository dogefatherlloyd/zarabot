import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Slide } from "@mui/material";
import { sendVerificationCode, submitVerificationCode } from "../network";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useLoginDialog } from "../utils";

export default function LoginModal() {
  const { isLoginOpen, setLoginOpen } = useLoginDialog();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const supabase = useSupabaseClient();

  async function handleSubmit() {
    const success = await submitVerificationCode(supabase, email, code);
    success && setLoginOpen(false);
  }

  return (
    <Dialog
      open={isLoginOpen}
      onClose={() => setLoginOpen(false)}
      TransitionComponent={Slide}
      keepMounted
      aria-describedby="alert-dialog-slide-description"
      PaperProps={{
        style: { borderRadius: 10, padding: "20px" },
      }}
    >
      <DialogTitle className="text-center">Log In - Artemis</DialogTitle>
      <DialogContent>
        <div className="my-4">
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@doe.com"
            margin="normal"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => sendVerificationCode(supabase, email)}
          >
            Send Code
          </Button>
        </div>

        <div className="my-4">
          <TextField
            fullWidth
            label="Verification Code"
            type="password"
            variant="outlined"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            margin="normal"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Sign In
          </Button>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setLoginOpen(false)} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}