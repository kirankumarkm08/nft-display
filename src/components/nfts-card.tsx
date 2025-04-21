"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Define NFT type based on OpenSea API response
export interface NFT {
  identifier: string;
  name?: string;
  description?: string;
  image_url?: string;
  contract: string;
  id: string;
  collection?: {
    name?: string;
  };
}

interface NFTCardProps {
  nft: NFT;
}

function NFTCard({ nft }: NFTCardProps) {
  // Handle potential undefined values safely
  const tokenId = nft.identifier || "";
  const title = nft.name || `NFT #${tokenId}`;
  const description = nft.description || "No description";
  const imageUrl =
    nft.image_url || `/placeholder.svg?height=400&width=400&query=NFT`;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = "/abstract-nft-concept.png";
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4">
        <h3 className="font-semibold truncate w-full">{title}</h3>
        <p className="text-sm text-muted-foreground truncate w-full">
          {description}
        </p>
        <div className="flex justify-between w-full mt-2">
          <span className="text-xs text-muted-foreground">
            Token ID:{" "}
            {tokenId.length > 8 ? `${tokenId.substring(0, 6)}...` : tokenId}
          </span>
          <a
            href={`https://basescan.org/token/${nft.contract}?a=${tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            View <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

export default NFTCard;
