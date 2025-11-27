import MapContainer from "@/app/_containers/MapContainer";
import { PushNotificationManager } from "@/app/_components/PushNotificationManager";

const MapPage = () => {
  return (
    <section className="relative w-full h-[80vh]">
      <MapContainer />
      <PushNotificationManager />
    </section>
  );
};

export default MapPage;
