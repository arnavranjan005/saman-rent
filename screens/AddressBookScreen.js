import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import { useMe } from '../hooks/useAuth';
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
} from '../hooks/useAddresses';

const LABELS = ['Home', 'Work', 'Other'];

function blankForm() {
  return { label: 'Home', line: '', city: '', state: '', postalCode: '', coords: null, isDefault: false };
}

/** Turn a platform geocode result into Flipkart-style address lines. */
function geocodeToAddress(geo) {
  if (!geo) return null;
  const streetBits = [geo.streetNumber, geo.street].filter(Boolean).join(' ');
  const line =
    streetBits || [geo.name, geo.district].filter(Boolean).join(', ') || '';
  return {
    line,
    city: geo.city ?? '',
    state: geo.region ?? '',
    postalCode: geo.postalCode ?? '',
  };
}

export default function AddressBookScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const addressesQuery = useAddresses(Boolean(me));
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [locBusy, setLocBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const addresses = addressesQuery.data ?? [];
  const saving = createMutation.isPending || updateMutation.isPending;

  const openAdd = () => {
    setEditingId(null);
    setForm(blankForm());
    setFormError('');
    createMutation.reset();
    updateMutation.reset();
    setFormOpen(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      label: a.label,
      line: a.line,
      city: a.city ?? '',
      state: a.state ?? '',
      postalCode: a.postalCode ?? '',
      coords: { latitude: a.latitude, longitude: a.longitude },
      isDefault: a.isDefault,
    });
    setFormError('');
    createMutation.reset();
    updateMutation.reset();
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(blankForm());
    setFormError('');
  };

  const captureLocation = async () => {
    setLocBusy(true);
    setFormError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setFormError('Location permission denied. Allow it in settings to use live location.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      // Platform reverse-geocoder (Google on Android, Apple on iOS) — no API
      // key needed. Auto-fills the form Flipkart-style; GPS still goes to
      // the server with the payload.
      let filled = null;
      try {
        const results = await Location.reverseGeocodeAsync(coords);
        filled = geocodeToAddress(results?.[0]);
      } catch {
        filled = null;
      }
      setForm((f) => ({
        ...f,
        coords,
        line: filled?.line || f.line,
        city: filled?.city || f.city,
        state: filled?.state || f.state,
        postalCode: filled?.postalCode || f.postalCode,
      }));
      if (!filled?.line) {
        setFormError('Got your GPS location — type the street address below.');
      }
    } catch {
      setFormError('Could not get your location. Try again.');
    } finally {
      setLocBusy(false);
    }
  };

  const save = () => {
    setFormError('');
    if (form.line.trim().length < 3) {
      setFormError('Enter the street address (min 3 characters).');
      return;
    }
    if (!form.coords) {
      setFormError('Tap "Use my current location" to attach live GPS.');
      return;
    }
    const payload = {
      label: form.label,
      line: form.line.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      latitude: form.coords.latitude,
      longitude: form.coords.longitude,
      isDefault: form.isDefault,
    };
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            closeForm();
            addressesQuery.refetch();
          },
          onError: (e) => setFormError(e?.message ?? 'Could not save.'),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          closeForm();
          addressesQuery.refetch();
        },
        onError: (e) => setFormError(e?.message ?? 'Could not save.'),
      });
    }
  };

  const confirmDelete = (a) => {
    Alert.alert('Delete address?', `${a.label}: ${a.line}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(a.id, {
            onSuccess: () => addressesQuery.refetch(),
          }),
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await addressesQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (!me) {
    return (
      <View className="flex-1 bg-white p-5">
        <ScreenHeader title="Address Book" onBack={() => router.back()} backTestID="address-back" />
        <Text className="text-[#666] text-[13px] mt-2">Log in to save event addresses.</Text>
        <TouchableOpacity
          className="bg-primary rounded-xl p-[15px] items-center mt-4"
          onPress={() => router.push('/login')}
          testID="address-login-btn"
        >
          <Text className="text-white font-bold">Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white p-5"
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B2DF0']} />
      }
    >
      <ScreenHeader
        title="Address Book"
        onBack={() => router.back()}
        backTestID="address-back"
        right={
          !formOpen ? (
            <TouchableOpacity onPress={openAdd} testID="address-add-btn">
              <Ionicons name="add-circle-outline" size={26} color="#5B2DF0" />
            </TouchableOpacity>
          ) : null
        }
      />

      {formOpen && (
        <View className="bg-[#F8F7FF] rounded-2xl p-4 mb-4">
          <Text className="font-bold text-[13px] mb-2">Label</Text>
          <View className="flex-row gap-2 mb-3">
            {LABELS.map((l) => (
              <TouchableOpacity
                key={l}
                onPress={() => setForm((f) => ({ ...f, label: l }))}
                className={`px-4 py-2 rounded-full border ${
                  form.label === l ? 'bg-primary border-primary' : 'border-[#DDD] bg-white'
                }`}
                testID={`address-label-${l}`}
              >
                <Text className={`font-bold text-[13px] ${form.label === l ? 'text-white' : ''}`}>
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="font-bold text-[13px] mb-1.5">Street Address</Text>
          <TextInput
            className="border border-[#DDD] bg-white rounded-[10px] p-3.5 text-base mb-3"
            placeholder="House no, street, landmark"
            value={form.line}
            onChangeText={(v) => setForm((f) => ({ ...f, line: v }))}
            testID="address-line-input"
          />
          <Text className="font-bold text-[13px] mb-1.5">City</Text>
          <TextInput
            className="border border-[#DDD] bg-white rounded-[10px] p-3.5 text-base mb-3"
            placeholder="Koderma"
            value={form.city}
            onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
            testID="address-city-input"
          />
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <Text className="font-bold text-[13px] mb-1.5">State</Text>
              <TextInput
                className="border border-[#DDD] bg-white rounded-[10px] p-3.5 text-base mb-3"
                placeholder="Jharkhand"
                value={form.state}
                onChangeText={(v) => setForm((f) => ({ ...f, state: v }))}
                testID="address-state-input"
              />
            </View>
            <View className="w-[130px]">
              <Text className="font-bold text-[13px] mb-1.5">Pincode</Text>
              <TextInput
                className="border border-[#DDD] bg-white rounded-[10px] p-3.5 text-base mb-3"
                placeholder="825301"
                keyboardType="number-pad"
                maxLength={6}
                value={form.postalCode}
                onChangeText={(v) => setForm((f) => ({ ...f, postalCode: v.replace(/\D/g, '') }))}
                testID="address-pincode-input"
              />
            </View>
          </View>
          <TouchableOpacity
            className={`flex-row items-center justify-center rounded-xl p-3.5 mb-2 border border-primary ${
              locBusy ? 'opacity-60' : ''
            }`}
            onPress={captureLocation}
            disabled={locBusy}
            testID="address-locate-btn"
          >
            <Ionicons name="locate-outline" size={18} color="#5B2DF0" />
            <Text className="text-primary font-bold ml-2">
              {locBusy
                ? 'Locating…'
                : form.coords
                  ? `Located${form.city ? `: ${form.city}` : ''} — tap to refresh`
                  : 'Use my current location'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center py-2"
            onPress={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
            testID="address-default-toggle"
          >
            <Ionicons
              name={form.isDefault ? 'checkbox' : 'square-outline'}
              size={20}
              color="#5B2DF0"
            />
            <Text className="ml-2 text-[13px]">Set as default event location</Text>
          </TouchableOpacity>
          {!!formError && (
            <Text className="text-danger mt-1 font-semibold" testID="address-form-error">
              {formError}
            </Text>
          )}
          <View className="flex-row gap-2.5 mt-3">
            <TouchableOpacity
              className="flex-1 border border-[#DDD] bg-white rounded-xl p-[14px] items-center"
              onPress={closeForm}
              testID="address-cancel-btn"
            >
              <Text className="font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 bg-primary rounded-xl p-[14px] items-center ${saving ? 'opacity-60' : ''}`}
              onPress={save}
              disabled={saving}
              testID="address-save-btn"
            >
              <Text className="text-white font-bold">{saving ? 'Saving…' : 'Save Address'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {addressesQuery.isPending ? (
        <Text className="text-muted mt-4">Loading addresses…</Text>
      ) : addresses.length === 0 ? (
        <EmptyState message="No saved addresses. Tap + to add your first one." testID="address-empty" />
      ) : (
        addresses.map((a) => (
          <View key={a.id} className="bg-[#F8F7FF] rounded-2xl p-4 mb-3" testID={`address-${a.id}`}>
            <View className="flex-row items-center">
              <Text className="bg-primary/10 text-primary font-bold text-[12px] px-2.5 py-1 rounded-full">
                {a.label}
              </Text>
              {a.isDefault && (
                <Text className="bg-leaf/10 text-leaf font-bold text-[12px] px-2.5 py-1 rounded-full ml-2">
                  Default
                </Text>
              )}
            </View>
            <Text className="font-bold text-[15px] mt-2">{a.line}</Text>
            <Text className="text-[#666] text-[13px]">
              {[a.city, a.state].filter(Boolean).join(', ')}
              {a.postalCode ? ` — ${a.postalCode}` : ''}
            </Text>
            <View className="flex-row mt-3 gap-2.5">
              {!a.isDefault && (
                <TouchableOpacity
                  className="border border-primary rounded-lg px-3 py-2"
                  onPress={() => updateMutation.mutate({ id: a.id, payload: { isDefault: true } })}
                  testID={`address-default-${a.id}`}
                >
                  <Text className="text-primary font-bold text-[12px]">Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="border border-[#DDD] bg-white rounded-lg px-3 py-2"
                onPress={() => openEdit(a)}
                testID={`address-edit-${a.id}`}
              >
                <Text className="font-bold text-[12px]">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="border border-danger rounded-lg px-3 py-2"
                onPress={() => confirmDelete(a)}
                testID={`address-delete-${a.id}`}
              >
                <Text className="text-danger font-bold text-[12px]">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
