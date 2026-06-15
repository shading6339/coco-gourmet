import { DesignSystemPreview } from "@/app/design-system-preview";

export default function Home(): React.JSX.Element {
  return (
    <div className="app-scroll-root">
      <main className="page-shell page-shell--under-app-bar mx-auto">
        <DesignSystemPreview />
      </main>
    </div>
  );
}
