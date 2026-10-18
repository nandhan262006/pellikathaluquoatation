import "./quote.css";
import type { QuotationData } from "@/lib/quote/types";
import { addonDensity, paginateAddons } from "@/lib/quote/paginate";
import { CoverPage } from "./pages/cover";
import { AboutPage } from "./pages/about";
import { PlanPage } from "./pages/plan";
import { DeliverablesPage } from "./pages/deliverables";
import { AddonsPage } from "./pages/addons";
import { TimelinePage } from "./pages/timeline";
import { TermsPage } from "./pages/terms";
import { ContactPage } from "./pages/contact";

/**
 * Renders the full quotation document as a stack of A4 pages.
 * Page numbers reflect the final assembled order; the add-on section
 * automatically grows into continuation pages when needed.
 */
export function QuotationDocument({ data }: { data: QuotationData }) {
  const addonPages = paginateAddons(data.services);
  const density = addonDensity(data.services.length);

  // Slots before add-ons: cover, about, plan, deliverables
  const beforeAddons = 4;
  // Slots after add-ons: timeline, terms, contact
  const afterAddons = 3;

  return (
    <div className="quote-doc qstack">
      <CoverPage data={data} number={0} />
      <AboutPage data={data} number={1} />
      <PlanPage data={data} number={2} />
      <DeliverablesPage data={data} number={3} />

      {addonPages.map((page, i) => (
        <AddonsPage
          key={page.index}
          data={data}
          number={beforeAddons + i}
          services={page.services}
          density={density}
          continued={page.continued}
        />
      ))}

      <TimelinePage data={data} number={beforeAddons + addonPages.length} />
      <TermsPage data={data} number={beforeAddons + addonPages.length + 1} />
      <ContactPage
        data={data}
        number={beforeAddons + addonPages.length + afterAddons - 1}
      />
    </div>
  );
}
