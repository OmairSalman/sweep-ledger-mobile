export interface Asset{
    id: number,
    sweepId: number;
    barcodeValue: string;
    createdAt: Date;
}

export interface AddAssetResponse {
  asset: Asset;
  wasAlreadyPresent: boolean;
}