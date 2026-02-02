import DriverNav from "../../components/driver/driverNav";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DriverNav />
      <main>{children}</main>
    </>
  );
}