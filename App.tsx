import { useMemo, useState } from 'react';
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
  ArrowUpRight,
  Camera,
  ImagePlus,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';

import { GlassPanel } from './src/components/GlassPanel';
import { PrimaryButton } from './src/components/PrimaryButton';
import { ResultSection } from './src/components/ResultSection';
import { sampleResult } from './src/data/sampleResult';
import { analyzeImage, apiBaseUrl } from './src/lib/api';
import { colors, radii, spacing } from './src/theme';
import type { IdentifyResult } from './shared/types';

const insightPills = ['Object recognition', 'Context-aware summaries', 'Safety cues', 'Better-than-basic scan UX'];

export default function App() {
  const [fontsLoaded] = useFonts({ SpaceGrotesk_400Regular, SpaceGrotesk_700Bold });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confidenceLabel = useMemo(() => {
    if (!result) return null;
    return `${Math.round(result.confidence * 100)}% confidence`;
  }, [result]);

  if (!fontsLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access so OmniVue can inspect your image.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: true,
    });

    if (!picked.canceled) {
      setImageUri(picked.assets[0]?.uri ?? null);
      setResult(null);
      setErrorMessage(null);
    }
  };

  const capturePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access so OmniVue can capture and identify objects.');
      return;
    }

    const captured = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: true,
    });

    if (!captured.canceled) {
      setImageUri(captured.assets[0]?.uri ?? null);
      setResult(null);
      setErrorMessage(null);
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

  const useSample = () => {
    setResult(sampleResult);
    setImageUri(null);
    setErrorMessage(null);
  };

  return (
    <LinearGradient colors={[colors.paper, '#FFF0E6', '#E8F5F7']} style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroHeader}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Aperture size={18} color={colors.paper} />
            </View>
            <Text style={styles.brandText}>OmniVue AI</Text>
          </View>
          <Text style={styles.heroTitle}>Point. Capture. Understand what you are seeing.</Text>
          <Text style={styles.heroBody}>
            A more elegant image identifier built for confidence, context, and cleaner mobile UX.
          </Text>
        </View>

        <GlassPanel>
          <View style={styles.previewCard}>
            <View style={styles.previewTop}>
              <View>
                <Text style={styles.previewKicker}>Live preview</Text>
                <Text style={styles.previewTitle}>Designed to feel editorial, not generic.</Text>
              </View>
              <ArrowUpRight size={18} color={colors.ink} />
            </View>
            <View style={styles.thumbnailStrip}>
              <View style={[styles.thumbnail, styles.thumbnailPeach]} />
              <View style={[styles.thumbnail, styles.thumbnailSky]} />
              <View style={[styles.thumbnail, styles.thumbnailInk]} />
            </View>
            <View style={styles.pillWrap}>
              {insightPills.map((pill) => (
                <View key={pill} style={styles.pill}>
                  <Text style={styles.pillText}>{pill}</Text>
                </View>
              ))}
            </View>
          </View>
        </GlassPanel>

        <View style={styles.actionStack}>
          <PrimaryButton label="Capture now" onPress={capturePhoto} icon={Camera} />
          <PrimaryButton label="Upload image" onPress={choosePhoto} icon={ImagePlus} tone="light" />
        </View>

        <Pressable onPress={useSample} style={styles.sampleLink}>
          <Sparkles size={16} color={colors.teal} />
          <Text style={styles.sampleLinkText}>Use a polished sample result</Text>
        </Pressable>

        {imageUri ? (
          <GlassPanel>
            <View style={styles.imagePanel}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <Text style={styles.imageCaption}>Selected image ready for analysis</Text>
            </View>
          </GlassPanel>
        ) : null}

        <GlassPanel>
          <View style={styles.analysisPanel}>
            <View style={styles.analysisHeader}>
              <View>
                <Text style={styles.sectionKicker}>Scan engine</Text>
                <Text style={styles.sectionTitle}>Get a structured answer, not just a label.</Text>
              </View>
              <ScanSearch size={20} color={colors.teal} />
            </View>
            <Text style={styles.analysisBody}>
              OmniVue sends the image to a multimodal vision endpoint and returns object identity, alternatives,
              practical tips, safety notes, and follow-up prompts.
            </Text>
            <PrimaryButton label="Analyze image" onPress={runAnalysis} icon={ScanSearch} busy={loading} disabled={!imageUri} />
            <Text style={styles.apiHint}>API target: {apiBaseUrl}</Text>
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
                <View style={styles.confidenceBadge}>
                  <ShieldCheck size={16} color={colors.success} />
                  <Text style={styles.confidenceText}>{confidenceLabel}</Text>
                </View>
              </View>

              <Text style={styles.summaryText}>{result.summary}</Text>

              <View style={styles.tagWrap}>
                {result.visualTags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <ResultSection title="Notable details" items={result.notableDetails} />
              <ResultSection title="Possible alternatives" items={result.possibleMatches} />
              <ResultSection title="Care or usage tips" items={result.careOrUsageTips} />
              <ResultSection title="Safety notes" items={result.safetyNotes} />
              <ResultSection title="Ask next" items={result.followUpPrompts} />

              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerTitle}>Important</Text>
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
  previewCard: {
    gap: spacing.md,
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  previewKicker: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.teal,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  previewTitle: {
    marginTop: 6,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.ink,
    fontSize: 23,
    lineHeight: 27,
    maxWidth: 250,
  },
  thumbnailStrip: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    flex: 1,
    height: 112,
    borderRadius: radii.md,
  },
  thumbnailPeach: {
    backgroundColor: colors.peach,
  },
  thumbnailSky: {
    backgroundColor: colors.sky,
  },
  thumbnailInk: {
    backgroundColor: '#8BA1B5',
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.ink,
    fontSize: 13,
  },
  actionStack: {
    gap: spacing.sm,
  },
  sampleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  sampleLinkText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.teal,
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
  apiHint: {
    color: colors.steel,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
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
  summaryText: {
    color: colors.ink,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    backgroundColor: colors.sand,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: colors.ink,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
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
