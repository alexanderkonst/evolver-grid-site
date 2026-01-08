// Types for Asset Mapping module
import { AssetTypeId } from './data/assetTypes';

export interface Asset {
    id: string;
    userId: string;
    typeId: AssetTypeId;
    subTypeId: string;
    categoryId: string;
    title: string;
    description?: string;
    value?: string; // Why this asset is valuable
    createdAt: string;
    updatedAt?: string;
}

export interface AssetInput {
    typeId: AssetTypeId;
    subTypeId: string;
    categoryId: string;
    title: string;
    description?: string;
    value?: string;
}
