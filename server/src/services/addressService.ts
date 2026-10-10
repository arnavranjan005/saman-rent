import { getPrisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

function db() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
  }
  return prisma;
}

export interface AddressInput {
  label: string;
  line: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

function cleanLabel(label: string): string {
  const allowed = ['Home', 'Work', 'Other'];
  const found = allowed.find((a) => a.toLowerCase() === label.trim().toLowerCase());
  if (!found) throw ApiError.badRequest('Label must be Home, Work or Other.', 'INVALID_LABEL');
  return found;
}

function cleanLine(line: string): string {
  const trimmed = line.trim().replace(/\s+/g, ' ');
  if (trimmed.length < 3 || trimmed.length > 200) {
    throw ApiError.badRequest('Address must be 3–200 characters.', 'INVALID_ADDRESS');
  }
  return trimmed;
}

function cleanCoords(latitude: number, longitude: number): void {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw ApiError.badRequest('Invalid GPS coordinates.', 'INVALID_COORDS');
  }
}

/** Default first, then newest — the checkout default is always on top. */
export async function listAddresses(userId: string) {
  return db().address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

async function ownedOrThrow(userId: string, id: string) {
  const prisma = db();
  const row = await prisma.address.findFirst({ where: { id, userId } });
  if (!row) throw ApiError.notFound('Address not found.', 'ADDRESS_NOT_FOUND');
  return row;
}

/** First address always becomes the default. */
export async function createAddress(userId: string, input: AddressInput) {
  const prisma = db();
  const label = cleanLabel(input.label);
  const line = cleanLine(input.line);
  cleanCoords(input.latitude, input.longitude);
  const city = input.city?.trim() ? input.city.trim().slice(0, 80) : null;
  const state = input.state?.trim() ? input.state.trim().slice(0, 80) : null;
  const postalCode = input.postalCode?.trim() ? input.postalCode.trim().slice(0, 20) : null;

  const count = await prisma.address.count({ where: { userId } });
  const isDefault = count === 0 ? true : input.isDefault === true;

  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: {
        userId,
        label,
        line,
        city,
        state,
        postalCode,
        latitude: input.latitude,
        longitude: input.longitude,
        isDefault,
      },
    });
  });
}

export async function updateAddress(userId: string, id: string, input: Partial<AddressInput>) {
  const existing = await ownedOrThrow(userId, id);
  const prisma = db();
  const data: {
    label?: string;
    line?: string;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  } = {};
  if (input.label !== undefined) data.label = cleanLabel(input.label);
  if (input.line !== undefined) data.line = cleanLine(input.line);
  if (input.city !== undefined) data.city = input.city?.trim() ? input.city.trim().slice(0, 80) : null;
  if (input.state !== undefined)
    data.state = input.state?.trim() ? input.state.trim().slice(0, 80) : null;
  if (input.postalCode !== undefined)
    data.postalCode = input.postalCode?.trim() ? input.postalCode.trim().slice(0, 20) : null;
  const latitude = input.latitude ?? existing.latitude;
  const longitude = input.longitude ?? existing.longitude;
  if (input.latitude !== undefined || input.longitude !== undefined) {
    cleanCoords(latitude, longitude);
    data.latitude = latitude;
    data.longitude = longitude;
  }
  if (input.isDefault !== undefined) data.isDefault = input.isDefault === true;

  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.update({ where: { id }, data });
  });
}

/** Deleting the default promotes the newest remaining address. */
export async function deleteAddress(userId: string, id: string) {
  const row = await ownedOrThrow(userId, id);
  const prisma = db();
  return prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } });
    if (row.isDefault) {
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return { deleted: true, id };
  });
}
