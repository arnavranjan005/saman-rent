import VendorServiceFormScreen from '../../screens/VendorServiceFormScreen';

export default function VendorServiceNewRoute() {
  // Distinct key from the edit route: same screen component must never
  // reuse a fiber across create/edit modes (stale field state + hook churn).
  return <VendorServiceFormScreen key="service-new" />;
}
