
"use client";

type Props = {
  user: {
    id: string;
    email?: string;
  };
  profile: {
    id: string;
    full_name: string | null;
    role: "driver";
  };
  children?: React.ReactNode;
};

export default function DriverApp({ children }: Props) {
  return <>{children}</>;
}
