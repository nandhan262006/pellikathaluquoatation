import { getTemplates, getOptionCatalog } from "@/lib/admin/template-actions";
import { getAdminMarket } from "@/lib/admin/market";
import { EditorShell } from "./editor-shell";

export const dynamic = "force-dynamic";

export default async function EstimatorEditorPage() {
  const market = await getAdminMarket();
  const templates = await getTemplates(market);
  const options = await getOptionCatalog();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Estimator Editor</h1>
      </div>
      <EditorShell templates={templates} market={market} options={options} />
    </div>
  );
}
