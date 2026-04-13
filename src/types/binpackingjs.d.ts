declare module "binpackingjs" {
  export namespace BP3D {
    class Packer {
      bins: Bin[];
      items: Item[];
      unfitItems: Item[];
      addBin(bin: Bin): void;
      addItem(item: Item): void;
      pack(): void;
    }

    class Bin {
      name: string;
      width: number;
      height: number;
      depth: number;
      maxWeight: number;
      items: Item[];
      unfittedItems: Item[];
      constructor(
        name: string,
        width: number,
        height: number,
        depth: number,
        maxWeight: number
      );
      getWidth(): number;
      getHeight(): number;
      getDepth(): number;
      getPackedWeight(): number;
      getBestRotationOrder(item: Item): number[];
      putItem(item: Item, p: number[]): boolean;
    }

    class Item {
      name: string;
      width: number;
      height: number;
      depth: number;
      weight: number;
      position: number[];
      rotationType: number;
      allowedRotation: number[];
      getDimension(): [number, number, number];
      constructor(
        name: string,
        width: number,
        height: number,
        depth: number,
        weight: number,
        allowedRotation?: number[]
      );
      getWeight(): number;
      getVolume(): number;
      intersect(item: Item): boolean;
    }
  }
}
