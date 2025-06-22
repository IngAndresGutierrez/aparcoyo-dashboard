"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";

const RegisterForm = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <h1>RegisterForm</h1>

      <div className="flex flex-col">
        <div className="flex flex-row w-full gap-4">
          <div className="p-4">
            <Input type="text" placeholder="Name" onChange={handleChange} />
          </div>
          <div className="p-4">
            <Input type="email" placeholder="Email" onChange={handleChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
