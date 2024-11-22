"use client";

import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useStorage from "@/hooks/useStorage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "You need to select a gender.",
  }),
});

export function InitializeUser() {
  const { getItem, setItem } = useStorage();
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    gender: "",
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: userInfo,
  });

  const createUser = api.user.create.useMutation();

  useEffect(() => {
    const userId = getItem("userId");
    if (!userId) {
      setOpen(true);
    }
  }, []);

  const handleSubmit = () => {
    createUser.mutate(
      {
        name: userInfo.name,
        email: userInfo.email,
        emailVerified: new Date(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.name}&top=${userInfo.gender === "male" ? "shortCurly" : "longHair"}&accessories=${userInfo.gender === "male" ? "prescription01" : "roundGlasses"}`,
      },
      {
        onSuccess: (newUser) => {
          setItem("userId", newUser?.id ?? "");
          setOpen(false);
        },
        onError: (error) => {
          console.error("Failed to create user:", error);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome! Please enter your information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Name"
            value={userInfo.name}
            onChange={(e) =>
              setUserInfo((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            type="email"
            placeholder="Email"
            value={userInfo.email}
            onChange={(e) =>
              setUserInfo((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <RadioGroup
            value={userInfo.gender}
            onChange={(e) =>
              setUserInfo((prev) => ({ ...prev, gender: e.target.value }))
            }
          >
            <RadioGroupLabel>Gender</RadioGroupLabel>
            <div className="flex flex-col gap-2">
              <RadioGroupItem value="male">Male</RadioGroupItem>
              <RadioGroupItem value="female">Female</RadioGroupItem>
              <RadioGroupItem value="other">Other</RadioGroupItem>
            </div>
          </RadioGroup>
        </div>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogContent>
    </Dialog>
  );
}
