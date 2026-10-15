"use client";

import useBlobity from "blobity/lib/react/useBlobity";
import { initialBlobityOptions } from "@/utils/blobity.config";

export default function PortfolioCursor() {
  useBlobity(initialBlobityOptions);
  return null;
}
