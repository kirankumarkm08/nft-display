import Image from "next/image";
import { ExternalLink } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface NFT {
  id: string;
  title: string;
  description: string;
  image: string;
  tokenId: string;
  contract: string;
}

interface NFTGridProps {
  nfts: NFT[];
}

function NFTGrid({ nfts }: NFTGridProps) {
  if (!nfts || nfts.length === 0) {
    return <p className="text-center">No NFTs found</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <Card key={nft.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              {nft.image ? (
                <Image
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.title || `NFT ${nft.tokenId}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/abstract-nft-concept.png";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Image
                    src={`/placeholder.svg?height=400&width=400&query=NFT`}
                    alt={nft.title || `NFT ${nft.tokenId}`}
                    width={400}
                    height={400}
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start p-4">
            <h3 className="font-semibold truncate w-full">
              {nft.title || `NFT #${nft.tokenId}`}
            </h3>
            <p className="text-sm text-muted-foreground truncate w-full">
              {nft.description || "No description"}
            </p>
            <div className="flex justify-between w-full mt-2">
              <span className="text-xs text-muted-foreground">
                Token ID:{" "}
                {nft.tokenId.length > 8
                  ? `${nft.tokenId.substring(0, 6)}...`
                  : nft.tokenId}
              </span>
              <a
                href={`https://basescan.org/token/${nft.contract}?a=${nft.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                View <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default NFTGrid;
