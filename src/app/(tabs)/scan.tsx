import ListToggle from "@/components/list-toggle";
import type { ProductMatch, SheetProduct } from "@/components/result-sheet";
import ProductResultSheet, { buildMatches } from "@/components/result-sheet";
import type { RestrictionList } from "@/context/profile-context";
import { Restriction, useProfile } from "@/context/profile-context";
import {
  getProductDetails,
  RateLimitError,
  uncheckable,
} from "@/lib/open-food-facts";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanScreen() {
  const { restrictions, lists } = useProfile();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const locked = useRef(false);
  const [selected, setSelected] = useState<{
    code: string;
    product: SheetProduct;
    matches: ProductMatch[];
  } | null>(null);
  const [openingCode, setOpeningCode] = useState<string | null>(null);
  const [filters, setFilters] = useState<string[]>(["mine"]);
  const [activeRestrictions, setActiveRestrictions] =
    useState<Restriction[]>(restrictions);

  const filterOptions: RestrictionList[] = [
    {
      id: "mine",
      name: "Mina restriktioner",
      restrictions,
    },
    ...lists.filter((list) => list.id !== "mine"),
  ];

  useEffect(() => {
    setActiveRestrictions(
      filterOptions
        .filter((list) => filters.includes(list.id))
        .flatMap((list) => list.restrictions),
    );
  }, [filters]);

  const openProduct = async (code: string) => {
    if (openingCode) return;
    setOpeningCode(code);
    try {
      const details = await getProductDetails(code);
      setSelected({
        code: details.code,
        product: details,
        matches: buildMatches(
          activeRestrictions,
          details.contains,
          details.traces,
          uncheckable(activeRestrictions, details),
        ),
      });
    } catch (e) {
      Alert.alert(
        e instanceof RateLimitError
          ? "För många förfrågningar"
          : "Kunde inte hämta produkten",
        "Försök igen om en stund.",
      );
    } finally {
      setOpeningCode(null);
    }
  };

  useEffect(() => {
    if (!selected) return;

    let cancelled = false;

    const refreshMatches = async () => {
      try {
        const details = await getProductDetails(selected.code);

        if (cancelled) return;

        const matches = buildMatches(
          activeRestrictions,
          details.contains,
          details.traces,
          uncheckable(activeRestrictions, details),
        );

        setSelected((current) => {
          if (!current || current.code !== selected.code) {
            return current;
          }

          return { ...current, matches };
        });
      } catch (error) {
        console.error("Failed to refresh matches:", error);
      }
    };

    refreshMatches();

    return () => {
      cancelled = true;
    };
  }, [filters, restrictions, lists, selected?.code]);

  const handleScan = useCallback(
    ({ data }: { data: string }) => {
      if (locked.current) return;
      locked.current = true; // ignore repeat reads of the same barcode...
      openProduct(data);
      setTimeout(() => (locked.current = false), 2000); // ...for 2 seconds
    },
    [openProduct],
  );

  // Permission state is still loading
  if (!permission) return <View className="flex-1 bg-cream" />;

  if (!permission.granted) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-cream">
        {isFocused && <StatusBar style="dark" />}
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center font-nunito text-lg text-ink">
            Vi behöver tillgång till kameran för att kunna skanna produkter.
          </Text>
          <Pressable
            onPress={() =>
              permission.canAskAgain
                ? requestPermission()
                : Linking.openSettings()
            }
            accessibilityRole="button"
            className="mt-8 rounded-full bg-primary px-8 py-3 active:opacity-80"
          >
            <Text className="font-nunito-bold text-xl text-white">
              {permission.canAskAgain ? "Tillåt kamera" : "Öppna inställningar"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* White status bar text over the camera. Only while this tab is
          focused, otherwise it would stick on the other tabs. */}
      {isFocused && <StatusBar style="light" />}
      {/* Only mount the camera while visible, so it stops in the background */}

      <View style={{ flex: 1, backgroundColor: "black" }}>
        {isFocused && (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
            }}
            onBarcodeScanned={handleScan}
          />
        )}
      </View>

      {/* Scan frame, centered over the camera */}
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
      >
        <View className="aspect-square w-[64%]">
          <Corner className="left-0 top-0 rounded-tl-2xl border-l-[8px] border-t-[8px]" />
          <Corner className="right-0 top-0 rounded-tr-2xl border-r-[8px] border-t-[8px]" />
          <Corner className="bottom-0 left-0 rounded-bl-2xl border-b-[8px] border-l-[8px]" />
          <Corner className="bottom-0 right-0 rounded-br-2xl border-b-[8px] border-r-[8px]" />
        </View>
      </View>

      <View className="absolute inset-0 items-end justify-start top-16 right-6">
        <ListToggle
          options={filterOptions}
          value={filters}
          onChange={setFilters}
        />
      </View>

      <ProductResultSheet
        visible={selected !== null}
        product={selected?.product ?? null}
        matches={selected?.matches ?? []}
        onClose={() => setSelected(null)}
        onShowIngredients={() => {
          if (!selected) return;
          router.push({
            pathname: "/product/[id]",
            params: { id: selected.code },
          });
          setSelected(null);
        }}
        filterOptions={filterOptions}
        filters={filters}
        setFilters={setFilters}
      />
    </View>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <View
      accessibilityElementsHidden
      className={`absolute h-[28%] w-[28%] border-cream ${className}`}
    />
  );
}
