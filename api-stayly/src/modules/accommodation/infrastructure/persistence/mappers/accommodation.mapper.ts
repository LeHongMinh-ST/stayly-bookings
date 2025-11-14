/**
 * AccommodationMapper
 * Maps between Domain Entity and ORM Entity
 */

import { Injectable } from "@nestjs/common";
import { Accommodation } from "../../../domain/entities/accommodation.entity";
import { AccommodationOrmEntity } from "../entities/accommodation.orm-entity";
import { AccommodationId } from "../../../domain/value-objects/accommodation-id.vo";
import {
  AccommodationStatus,
  AccommodationStatusVO,
} from "../../../domain/value-objects/accommodation-status.vo";
import { Address } from "../../../domain/value-objects/address.vo";
import { Location } from "../../../domain/value-objects/location.vo";
import { Policies } from "../../../domain/value-objects/policies.vo";
import {
  CancellationPolicy,
  CancellationPolicyType,
} from "../../../domain/value-objects/cancellation-policy.vo";

@Injectable()
export class AccommodationMapper {
  toOrmEntity(accommodation: Accommodation): AccommodationOrmEntity {
    const ormEntity = new AccommodationOrmEntity();
    ormEntity.id = accommodation.getId().getValue();
    ormEntity.type = accommodation.getType();
    ormEntity.name = accommodation.getName();
    ormEntity.status = accommodation.getStatus().getValue();
    ormEntity.ownerId = accommodation.getOwnerId();

    // Address
    const address = accommodation.getAddress();
    ormEntity.street = address.getStreet();
    ormEntity.ward = address.getWard();
    ormEntity.district = address.getDistrict();
    ormEntity.province = address.getProvince();
    ormEntity.country = address.getCountry();

    // Location
    const location = accommodation.getLocation();
    ormEntity.latitude = location.getLatitude();
    ormEntity.longitude = location.getLongitude();

    ormEntity.description = accommodation.getDescription();
    ormEntity.images = accommodation.getImages();
    ormEntity.amenities = accommodation.getAmenities();

    // Policies
    const policies = accommodation.getPolicies();
    ormEntity.checkInTime = policies.getCheckInTime();
    ormEntity.checkOutTime = policies.getCheckOutTime();
    ormEntity.childrenAllowed = policies.isChildrenAllowed();
    ormEntity.petsAllowed = policies.isPetsAllowed();
    ormEntity.smokingAllowed = policies.isSmokingAllowed();

    // Cancellation policy
    const cancellationPolicy = accommodation.getCancellationPolicy();
    ormEntity.cancellationPolicyType = cancellationPolicy.getType();
    ormEntity.freeCancellationDays =
      cancellationPolicy.getFreeCancellationDays();
    ormEntity.refundPercentage = cancellationPolicy.getRefundPercentage();

    ormEntity.approvedBy = accommodation.getApprovedBy();
    ormEntity.approvedAt = accommodation.getApprovedAt();

    return ormEntity;
  }

  toDomain(ormEntity: AccommodationOrmEntity): Accommodation {
    // Create value objects
    const address = Address.create({
      street: ormEntity.street,
      ward: ormEntity.ward,
      district: ormEntity.district,
      province: ormEntity.province,
      country: ormEntity.country,
    });

    const location = Location.create(ormEntity.latitude, ormEntity.longitude);

    const policies = Policies.create({
      checkInTime: ormEntity.checkInTime,
      checkOutTime: ormEntity.checkOutTime,
      childrenAllowed: ormEntity.childrenAllowed,
      petsAllowed: ormEntity.petsAllowed,
      smokingAllowed: ormEntity.smokingAllowed,
    });

    const cancellationPolicy = CancellationPolicy.create({
      type: ormEntity.cancellationPolicyType as CancellationPolicyType,
      freeCancellationDays: ormEntity.freeCancellationDays,
      refundPercentage: ormEntity.refundPercentage,
    });

    // Rehydrate domain entity from database
    return Accommodation.rehydrate({
      id: AccommodationId.create(ormEntity.id),
      type: ormEntity.type,
      name: ormEntity.name,
      status: AccommodationStatusVO.create(ormEntity.status),
      ownerId: ormEntity.ownerId,
      address,
      location,
      description: ormEntity.description,
      images: ormEntity.images,
      amenities: ormEntity.amenities,
      policies,
      cancellationPolicy,
      approvedBy: ormEntity.approvedBy,
      approvedAt: ormEntity.approvedAt,
    });
  }
}
