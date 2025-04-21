"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Loader2 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NFTGrid from "@/components/nfts-grid";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState("");

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const fetchNFTs = async () => {
    if (!address) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.opensea.io/api/v2/chain/base/account/0x5dadb2e88cf9cc2b6f53b5e7413ebfa1a7d740a1/nfts?limit=50`,
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
        setNfts(data.nfts);
        console.log(data.nfts);
        if (data.nfts.length === 0) {
          setError("No NFTs found for this wallet on Base network");
        }
      } else {
        setError("No NFTs data in the response");
        setNfts([]);
      }
    } catch (error: any) {
      console.error("Error fetching NFTs:", error);
      setError(`Error fetching NFTs: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setNfts([]);
    setError("");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Base Network NFT Explorer
            </CardTitle>
            <CardDescription>
              Connect your wallet to view your NFTs on the Base network
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isConnected ? (
              <div className="flex justify-center py-8">
                <ConnectButton />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Connected Wallet</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {address}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={fetchNFTs} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading
                        </>
                      ) : (
                        "Fetch NFTs"
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}

                {nfts.length > 0 ? (
                  <NFTGrid nfts={nfts} />
                ) : (
                  <div className="text-center py-12">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    ) : (
                      <p className="text-muted-foreground">
                        {!error &&
                          "Click 'Fetch NFTs' to view your NFTs on Base network"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {/* <CardFooter className="flex justify-between border-t p-4">
            <p className="text-xs text-muted-foreground">
              Powered by Base Network
            </p>
          </CardFooter> */}
        </Card>
      </div>
    </main>
  );
}
