import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import {
  Aperture,
  Camera,
  ImagePlus,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react-native';

import { GlassPanel } from './src/components/GlassPanel';
import { PrimaryButton } from './src/components/PrimaryButton';
import { ResultSection } from './src/components/ResultSection';
import { analyzeImage, apiBaseUrl } from './src/lib/api';
import { colors, radii, spacing } from './src/theme';
import type { IdentifyResult } from './shared/types';

export default function App() {
  const [fontsLoaded] = useFonts({ SpaceGrotesk_400Regular, SpaceGrotesk_700Bold });
  const scrollRef = useRef<ScrollView | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confidenceLabel = useMemo(() => {
    if (!result) return null;
    return `${Math.round(result.confidence * 100)}% confidence`;
  }, [result]);

  const isDemoResult = result?.detectedName.includes('(demo mode)') ?? false;

  if (!fontsLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  const applyPickedImage = (uri?: string | null) => {
    if (!uri) {
      setImageUri(null);
      setResult(null);
      setErrorMessage('We could not read the selected image. Please try a different photo.');
      return;
    }

    setImageUri(uri);
    setResult(null);
    setErrorMessage(null);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 880, animated: true });
    });
  };

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access so OmniVue can inspect your image.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      selectionLimit: 1,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
    });

    if (!picked.canceled) {
      applyPickedImage(picked.assets[0]?.uri);
    }
  };

  const capturePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access so OmniVue can capture and identify objects.');
      return;
    }

    const captured = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: true,
    });

    if (!captured.canceled) {
      applyPickedImage(captured.assets[0]?.uri);
    }
  };

  const runAnalysis = async () => {
    if (!imageUri) {
      Alert.alert('Add an image first', 'Capture or upload a photo before you start the scan.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const identified = await analyzeImage(imageUri);
      setResult(identified);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to analyze this image right now.';
      setErrorMessage(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.paper, '#FFF0E6', '#E8F5F7']} style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroHeader}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Aperture size={18} color={colors.paper} />
            </View>
            <Text style={styles.brandText}>OmniVue AI</Text>
          </View>
          <Text style={styles.heroTitle}>Capture or upload to analyze.</Text>
          <Text style={styles.heroBody}>Take a photo or choose one image.</Text>
        </View>

        <View style={styles.actionStack}>
          <PrimaryButton label="Capture" onPress={capturePhoto} icon={Camera} />
          <PrimaryButton label="Upload" onPress={choosePhoto} icon={ImagePlus} tone="light" />
        </View>

        {imageUri ? (
          <View style={styles.selectionBanner}>
            <Text style={styles.selectionBannerTitle}>Image ready</Text>
            <Text style={styles.selectionBannerBody}>Tap Analyze.</Text>
          </View>
        ) : null}

        {imageUri ? (
          <GlassPanel>
            <View style={styles.imagePanel}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <Text style={styles.imageCaption}>Selected image</Text>
            </View>
          </GlassPanel>
        ) : null}

        <GlassPanel>
          <View style={styles.analysisPanel}>
            <View style={styles.analysisHeader}>
              <View>
                <Text style={styles.sectionKicker}>Analyze</Text>
                <Text style={styles.sectionTitle}>Identify the main object.</Text>
              </View>
              <ScanSearch size={20} color={colors.teal} />
            </View>
            <Text style={styles.analysisBody}>Get a short result for the image you uploaded.</Text>
            <PrimaryButton label="Analyze" onPress={runAnalysis} icon={ScanSearch} busy={loading} disabled={!imageUri} />
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </View>
        </GlassPanel>

        {result ? (
          <GlassPanel>
            <View style={styles.resultPanel}>
              <View style={styles.resultHero}>
                <View style={styles.resultHeading}>
                  <Text style={styles.sectionKicker}>Primary match</Text>
                  <Text style={styles.resultName}>{result.detectedName}</Text>
                  <Text style={styles.resultCategory}>{result.category}</Text>
                </View>
                <View style={styles.badgeRow}>
                  <View style={[styles.modeBadge, isDemoResult ? styles.demoModeBadge : styles.liveModeBadge]}>
                    <Text style={[styles.modeBadgeText, isDemoResult ? styles.demoModeText : styles.liveModeText]}>
                      {isDemoResult ? 'DEMO' : 'LIVE'}
                    </Text>
                  </View>
                  <View style={styles.confidenceBadge}>
                    <ShieldCheck size={16} color={colors.success} />
                    <Text style={styles.confidenceText}>{confidenceLabel}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.summaryText}>{result.summary}</Text>

              {!isDemoResult ? <ResultSection title="Details" items={result.notableDetails} /> : null}
              {!isDemoResult ? <ResultSection title="Similar" items={result.possibleMatches} /> : null}

              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerTitle}>Note</Text>
                <Text style={styles.disclaimerText}>{result.disclaimer}</Text>
              </View>
            </View>
          </GlassPanel>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 74,
    paddingBottom: 56,
    gap: spacing.lg,
  },
  heroHeader: {
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  brandText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: colors.ink,
  },
  heroTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.ink,
    fontSize: 34,
    lineHeight: 38,
    maxWidth: '92%',
  },
  heroBody: {
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.steel,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: '95%',
  },
  actionStack: {
    gap: spacing.sm,
  },
  selectionBanner: {
    borderRadius: radii.md,
    backgroundColor: '#E9F7F5',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  selectionBannerTitle: {
    color: colors.teal,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
  },
  selectionBannerBody: {
    color: colors.steel,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  imagePanel: {
    gap: spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: radii.md,
    backgroundColor: colors.mist,
  },
  imageCaption: {
    color: colors.steel,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  analysisPanel: {
    gap: spacing.md,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  sectionKicker: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.teal,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    marginTop: 6,
    color: colors.ink,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    lineHeight: 28,
    maxWidth: 260,
  },
  analysisBody: {
    color: colors.steel,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 15,
    lineHeight: 23,
  },
  errorText: {
    color: '#A22F27',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    lineHeight: 19,
  },
  resultPanel: {
    gap: spacing.lg,
  },
  resultHero: {
    gap: spacing.md,
  },
  resultHeading: {
    gap: 6,
  },
  resultName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 30,
    lineHeight: 34,
    color: colors.ink,
  },
  resultCategory: {
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.steel,
    fontSize: 17,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAF7EF',
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  confidenceText: {
    color: colors.success,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  modeBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  demoModeBadge: {
    backgroundColor: '#FFF0E4',
  },
  liveModeBadge: {
    backgroundColor: '#E6F6EC',
  },
  modeBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
  },
  demoModeText: {
    color: colors.coral,
  },
  liveModeText: {
    color: colors.success,
  },
  summaryText: {
    color: colors.ink,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  disclaimerBox: {
    borderRadius: radii.md,
    backgroundColor: '#FFF6E9',
    padding: 16,
    gap: 8,
  },
  disclaimerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.warning,
  },
  disclaimerText: {
    color: colors.steel,
    fontFamily: 'SpaceGrotesk_400Regular',
    lineHeight: 21,
  },
});
