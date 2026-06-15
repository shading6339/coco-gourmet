"use client";

import { useState, type JSX } from "react";

import { AnimatedNumber } from "@/components/ui/animated-number";
import {
  AppBar,
  Badge,
  Button,
  Input,
  SearchRangeTabs,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Typography,
  TypographyH1,
  TypographyH2,
  TypographyLead,
  TypographyMuted,
} from "@/components/ui";
import type { AppBarMode } from "@/components/ui/app-bar";
import { BottomNav, type BottomNavTab } from "@/components/ui/bottom-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassSelect } from "@/components/ui/glass-select";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { TEXT } from "@/constants/text";
import type { SearchRangeOption } from "@/types/search-range";

const SEARCH_RANGE_OPTIONS: readonly SearchRangeOption[] = [
  { label: "300m", value: "300", meters: 300 },
  { label: "500m", value: "500", meters: 500 },
  { label: "1km", value: "1000", meters: 1000 },
] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section className="space-y-3">
      <TypographyH2>{title}</TypographyH2>
      {children}
    </section>
  );
}

/** Issue 2–3: デザイントークン・UI プリミティブ・Liquid Glass の仮プレビュー（Storybook 代替） */
export function DesignSystemPreview(): JSX.Element {
  const [range, setRange] = useState("500");
  const [count, setCount] = useState(128);
  const [tab, setTab] = useState("tab-a");
  const [appBarMode, setAppBarMode] = useState<AppBarMode>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [navTab, setNavTab] = useState<BottomNavTab>("home");
  const [sortOrder, setSortOrder] = useState("distance");

  return (
    <>
      <AppBar
        mode={appBarMode}
        value={searchQuery}
        onChange={setSearchQuery}
        searchExpanded={searchExpanded}
        onSearchExpandedChange={setSearchExpanded}
        showFilter={appBarMode === "results"}
        filterActiveCount={appBarMode === "results" ? 3 : 0}
        filterExpanded={filterExpanded}
        onFilterClick={() => setFilterExpanded((open) => !open)}
        showBack={appBarMode === "results"}
        onBack={() => setAppBarMode("home")}
      />
      <div aria-hidden className="app-bar-spacer" />

      <div className="space-y-10 pb-8">
        <header className="space-y-2">
        <TypographyH1>{TEXT.common.appTitle}</TypographyH1>
        <TypographyLead>{TEXT.common.appDescription}</TypographyLead>
        <TypographyMuted>
          Warm Daylight Glass — 背景 <code className="text-xs">#fffcf9</code>
        </TypographyMuted>
      </header>

      <Section title="Typography">
        <div className="space-y-2">
          <Typography variant="headline-lg">headline-lg（font-brand）</Typography>
          <Typography variant="headline-md">headline-md</Typography>
          <Typography variant="body-md">body-md — 本文テキスト</Typography>
          <Typography variant="label-md">label-md</Typography>
          <TypographyMuted>muted — 補助テキスト</TypographyMuted>
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="chip">Chip</Badge>
        </div>
      </Section>

      <Section title="Card">
        <Card>
          <CardHeader>
            <CardTitle>カードタイトル</CardTitle>
            <CardDescription>surface + hairline + shadow-card（L1）</CardDescription>
          </CardHeader>
          <CardContent>
            <Typography variant="body-md">カード本文。borderless + gap で区切る。</Typography>
          </CardContent>
          <CardFooter>
            <Button size="sm">アクション</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Input">
        <Input placeholder={TEXT.common.mapKeywordPlaceholder} aria-label="キーワード" />
      </Section>

      <Section title="Tabs">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="tab-a">タブ A</TabsTrigger>
            <TabsTrigger value="tab-b">タブ B</TabsTrigger>
          </TabsList>
          <TabsContent value="tab-a" className="pt-2">
            <TypographyMuted>タブ A の内容</TypographyMuted>
          </TabsContent>
          <TabsContent value="tab-b" className="pt-2">
            <TypographyMuted>タブ B の内容</TypographyMuted>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="AnimatedNumber">
        <div className="flex items-center gap-3">
          <span className="font-brand text-3xl font-bold tabular-nums">
            <AnimatedNumber value={count} />
          </span>
          <span className="text-sm text-muted-foreground">件</span>
          <Button size="sm" variant="outline" onClick={() => setCount((c) => c + 37)}>
            +37
          </Button>
        </div>
      </Section>

      <Section title="SearchRangeTabs">
        <SearchRangeTabs
          value={range}
          onValueChange={setRange}
          options={SEARCH_RANGE_OPTIONS}
        />
      </Section>

      <Section title="Liquid Glass">
        <TypographyMuted>
          上部 AppBar・下部 BottomNav は固定配置。タブ切替で pill モーフ、ボタン押下で spring を確認。
        </TypographyMuted>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={appBarMode === "home" ? "default" : "outline"}
            onClick={() => {
              setAppBarMode("home");
              setFilterExpanded(false);
            }}
          >
            AppBar: home
          </Button>
          <Button
            size="sm"
            variant={appBarMode === "results" ? "default" : "outline"}
            onClick={() => {
              setAppBarMode("results");
              setSearchExpanded(true);
            }}
          >
            AppBar: results
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <LiquidGlassButton variant="glass" className="px-4 py-2">
            Glass
          </LiquidGlassButton>
          <LiquidGlassButton variant="primary" className="px-4 py-2">
            Primary
          </LiquidGlassButton>
          <LiquidGlassButton variant="on-glass" className="px-4 py-2">
            On glass
          </LiquidGlassButton>
        </div>
        <GlassPanel className="flex flex-wrap items-center gap-2 p-3">
          <GlassBadge>neutral</GlassBadge>
          <GlassBadge variant="active">active</GlassBadge>
          <GlassSelect
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            aria-label="並び順"
          >
            <option value="distance">距離順</option>
            <option value="rating">評価順</option>
          </GlassSelect>
        </GlassPanel>
      </Section>

      <Section title="Glass">
        <div className="space-y-3">
          <div className="glass rounded-lg px-4 py-3">
            <Typography variant="label-md">.glass（L2 chrome）</Typography>
            <TypographyMuted>backdrop-filter: blur(20px)</TypographyMuted>
          </div>
          <div className="glass-float rounded-float px-4 py-3">
            <Typography variant="label-md">.glass-float（L3 float）</Typography>
            <TypographyMuted>backdrop-filter: blur(12px)</TypographyMuted>
          </div>
          <div className="h-16 rounded-lg skeleton" aria-hidden />
        </div>
      </Section>
      </div>

      <BottomNav active={navTab} onChange={setNavTab} />
    </>
  );
}
