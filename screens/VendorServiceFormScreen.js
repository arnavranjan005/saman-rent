import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { uploadServiceImage } from '../lib/cloudinary';
import { resolveImage } from '../lib/serviceImage';
import { useCategories } from '../hooks/useServices';
import {
  useAddVendorServiceImage,
  useCreateVendorService,
  useRemoveVendorServiceImage,
  useUpdateVendorService,
  useVendorMe,
  useVendorServices,
} from '../hooks/useVendor';

export default function VendorServiceFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEdit = Boolean(id);
  const { data: me } = useVendorMe();
  const services = useVendorServices(Boolean(me) && isEdit);
  const categories = useCategories();
  const create = useCreateVendorService();
  const update = useUpdateVendorService();
  const addImage = useAddVendorServiceImage();
  const removeImage = useRemoveVendorServiceImage();

  const existing = isEdit
    ? (services.data ?? []).find((s) => s.id === id)
    : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? existing?.category?.id ?? 'dj');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Create mode must always open blank: the navigator can hand us a reused
  // fiber holding a previous visit's field state, so reset on every focus.
  useFocusEffect(
    React.useCallback(() => {
      if (!isEdit) {
        setName('');
        setCategoryId('dj');
        setPrice('');
        setLocation('');
        setDescription('');
        setUploadError(null);
      }
    }, [isEdit]),
  );

  // Seed field state once the existing service loads (edit mode only —
  // create mode must always start empty, even if route params lag a render).
  React.useEffect(() => {
    if (isEdit && existing && !name) {
      setName(existing.name ?? '');
      setCategoryId(existing.categoryId ?? existing.category?.id ?? 'dj');
      setPrice(String(existing.price ?? ''));
      setLocation(existing.location ?? '');
      setDescription(existing.description ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, existing?.id]);

  if (!me) return <LoadingState testID="vendor-form-loading" />;
  if (isEdit && services.isPending) return <LoadingState testID="vendor-form-service-loading" />;
  // While refetching (e.g. right after create), hold the loader instead of
  // flashing "Service not found" when the cache hasn't caught up yet.
  if (isEdit && !existing && services.isFetching) {
    return <LoadingState testID="vendor-form-service-loading" />;
  }
  if (isEdit && (services.isError || !existing)) {
    return (
      <ErrorState
        testID="vendor-form-error"
        message={services.error?.message ?? 'Service not found.'}
        onRetry={() => services.refetch()}
      />
    );
  }

  const mutation = isEdit ? update : create;
  const mutationError = mutation.error;

  const submit = () => {
    const payload = {
      name,
      categoryId,
      price: parseInt(price, 10) || 0,
      location: location || undefined,
      description: description || undefined,
    };
    if (isEdit) {
      update.mutate(
        { id, payload },
        { onSuccess: () => router.back() },
      );
    } else {
      create.mutate(payload, {
        onSuccess: (svc) =>
          router.replace({ pathname: '/(vendor)/service/[id]', params: { id: svc.id } }),
      });
    }
  };

  const pickImage = async () => {
    setUploadError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setUploadError('Gallery permission is required to upload photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setUploading(true);
    try {
      const { secureUrl, publicId } = await uploadServiceImage(result.assets[0].uri);
      await addImage.mutateAsync({ id, payload: { url: secureUrl, publicId } });
    } catch (e) {
      setUploadError(e?.message ?? 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const images = existing?.images ?? [];

  return (
    <ScrollView className="flex-1 bg-white p-5" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="flex-row items-center mt-2 mb-4">
        <TouchableOpacity onPress={() => router.back()} testID="vendor-form-back">
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text className="font-extrabold text-lg ml-3">
          {isEdit ? 'Edit Service' : 'Add Service'}
        </Text>
      </View>

      <Text className="font-semibold text-[13px] mb-1.5">Service Name</Text>
      <TextInput
        className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
        placeholder="Royal DJ Sound"
        value={name}
        onChangeText={setName}
        testID="vendor-service-name"
      />

      <Text className="font-semibold text-[13px] mt-3 mb-1.5">Category</Text>
      <View className="flex-row flex-wrap">
        {(categories.data ?? []).map((c) => (
          <TouchableOpacity
            key={c.id}
            className={`border rounded-full px-3.5 py-2 mr-2 mb-2 ${categoryId === c.id ? 'bg-primary border-primary' : 'border-[#DDD]'}`}
            onPress={() => setCategoryId(c.id)}
            testID={`vendor-cat-${c.id}`}
          >
            <Text
              className={`text-xs ${categoryId === c.id ? 'text-white font-bold' : 'text-[#333]'}`}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="font-semibold text-[13px] mt-3 mb-1.5">Price (₹, per hour)</Text>
      <TextInput
        className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
        placeholder="15000"
        keyboardType="number-pad"
        value={price}
        onChangeText={(t) => setPrice(t.replace(/\D/g, ''))}
        testID="vendor-service-price"
      />

      <Text className="font-semibold text-[13px] mt-3 mb-1.5">Location</Text>
      <TextInput
        className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
        placeholder="Koderma, Jharkhand"
        value={location}
        onChangeText={setLocation}
        testID="vendor-service-location"
      />

      <Text className="font-semibold text-[13px] mt-3 mb-1.5">Description</Text>
      <TextInput
        className="border border-[#DDD] rounded-[10px] p-3.5 text-base min-h-[80px]"
        placeholder="Describe your service…"
        value={description}
        onChangeText={setDescription}
        multiline
        testID="vendor-service-description"
      />

      {isEdit && (
        <>
          <Text className="font-semibold text-[13px] mt-4 mb-1.5">Photos</Text>
          <View className="flex-row flex-wrap">
            {images.map((img) => (
              <View key={img.id} className="mr-2.5 mb-2.5">
                <Image
                  source={resolveImage(img.url)}
                  className="w-[88px] h-[88px] rounded-xl"
                />
                <TouchableOpacity
                  className="absolute -top-2 -right-2 bg-white rounded-full border border-[#DDD]"
                  onPress={() => removeImage.mutate({ id, imageId: img.id })}
                  testID={`vendor-image-del-${img.id}`}
                >
                  <Ionicons name="close-circle" size={22} color={COLORS.red} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              className="w-[88px] h-[88px] rounded-xl border border-dashed border-[#BBB] items-center justify-center"
              onPress={pickImage}
              disabled={uploading}
              testID="vendor-image-add-btn"
            >
              <Ionicons
                name={uploading ? 'hourglass-outline' : 'add'}
                size={28}
                color={COLORS.primary}
              />
              <Text className="text-[10px] text-[#666]">
                {uploading ? 'Uploading…' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
          {uploadError && (
            <Text className="text-danger text-xs mt-1.5 font-semibold">{uploadError}</Text>
          )}
        </>
      )}

      {mutationError && (
        <Text className="text-danger mt-3 font-semibold" testID="vendor-form-submit-error">
          {mutationError?.message ?? 'Could not save. Try again.'}
        </Text>
      )}
      <TouchableOpacity
        className={`bg-primary rounded-xl p-[15px] items-center mt-5 ${mutation.isPending ? 'opacity-60' : ''}`}
        onPress={submit}
        disabled={mutation.isPending}
        testID="vendor-service-save-btn"
      >
        <Text className="text-white font-bold">
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Service'}
        </Text>
      </TouchableOpacity>
      {!isEdit && (
        <Text className="text-xs text-muted text-center mt-2.5">
          New services need approval before going live. You can add photos after creating.
        </Text>
      )}
    </ScrollView>
  );
}
