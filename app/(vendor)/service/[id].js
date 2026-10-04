import { useLocalSearchParams } from 'expo-router';
import VendorServiceFormScreen from '../../../screens/VendorServiceFormScreen';

export default function VendorServiceEditRoute() {
  const { id } = useLocalSearchParams();
  // Key by service id (and distinct from the create route) so each edit
  // mounts fresh — no stale field state, no hook-count churn on transitions.
  return <VendorServiceFormScreen key={`service-edit-${id}`} />;
}
