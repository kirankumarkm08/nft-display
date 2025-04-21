"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
} from "wagmi";
// import { injected } from "wagmi/connectors";
import NFTCard, { type NFT } from "@/components/nfts-card";
import WalletInfo from "@/components/Wallet-Info";
import { base } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isAddress } from "viem";

export default function Dashboard() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [baseNfts, setBaseNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({ address: evmAddress });
  // const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const networkName = chainId === base.id ? "Base" : "Optimism";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isEvmConnected) {
      router.push("/");
    }
  }, [isClient, isEvmConnected, router]);

  const fetchBaseNFTs = async () => {
    if (!isEvmConnected || !evmAddress) return;

    setLoading(true);
    setError(null);

    try {
      // const address = evmAddress;
      const testAddress = "0x5dadb2e88cf9cc2b6f53b5e7413ebfa1a7d740a1";

      const response = await fetch(
        `https://api.opensea.io/api/v2/chain/base/account/${testAddress}/nfts?limit=50`,
        {
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_OPENSEA_API_KEY || "",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.nfts) {
        setBaseNfts(data.nfts);
        if (data.nfts.length === 0) {
          setError("No NFTs found for this wallet on Base network");
        }
      } else {
        setError("No NFTs data in the response");
        setBaseNfts([]);
      }
    } catch (err: any) {
      console.error("Error fetching Base NFTs:", err);
      setError(`Failed to fetch Base NFTs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && isEvmConnected) {
      fetchBaseNFTs();
    }
  }, [isClient, evmAddress, isEvmConnected]);

  const handleDisconnect = () => {
    disconnect();
    setBaseNfts([]);
    setError(null);
  };

  if (!isClient) {
    return (
      <main className="container mx-auto py-20 px-4 max-w-6xl">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </main>
    );
  }

  if (!isEvmConnected) return null;

  return (
    <main className="container mx-auto py-20 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Base Network NFT Dashboard</h1>
        <ConnectButton />
      </div>

      {evmAddress && (
        <div className="mb-6">
          <WalletInfo
            address={evmAddress}
            networkName={networkName}
            balance={balanceData?.formatted || "0"}
            getExplorerUrl={(addr) => `https://basescan.org/address/${addr}`}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your NFTs on Base Network</h2>

        <div className="flex gap-2">
          <Button onClick={fetchBaseNFTs} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              "Refresh NFTs"
            )}
          </Button>
          <Button variant="outline" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-[300px] w-full rounded-t-md" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : baseNfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {baseNfts.map((nft) => (
            <NFTCard key={`${nft.contract}:${nft.name}`} nft={nft} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Image
              src="/abstract-nft-concept.png"
              alt="No NFTs"
              width={100}
              height={100}
            />
            <p className="mt-4 text-center text-muted-foreground">
              No NFTs found in your Base wallet
            </p>
            <p className="text-sm text-center text-muted-foreground mt-2">
              Try getting some NFTs on the Base network or{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={fetchBaseNFTs}
              >
                click here
              </Button>{" "}
              to refresh
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
