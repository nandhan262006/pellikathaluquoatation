import "./quote.css";
import type { ReactNode } from "react";
import type { QuotationData } from "@/lib/quote/types";
import {
  addonDensity,
  chargeDensity,
  paginateAddons,
  paginateCharges,
  paginatePlanEvents,
  paginateTerms,
  paginateTimeline,
  planDensity,
  timelineDensity,
} from "@/lib/quote/paginate";
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
 * Every content section (plan schedule, deliverables charges, add-ons,
 * delivery timeline, terms) grows into "— Continued" pages when its rows
 * exceed one page. Page numbers reflect the final assembled order: each
 * section hands its continuation pages to a shared sequential slot counter
 * so later sections renumber automatically.
 */
export function QuotationDocument({ data }: { data: QuotationData }) {
  const planPages = paginatePlanEvents(data.events);
  const chargePages = paginateCharges(data.charges);
  const addonPages = paginateAddons(data.services);
  const timelinePages = paginateTimeline(data.timeline);
  const termPages = paginateTerms(data.terms);

  const pages: ReactNode[] = [];
  let n = 0;
  const slot = () => n++;

  pages.push(<CoverPage key="cover" data={data} number={slot()} />);
  pages.push(<AboutPage key="about" data={data} number={slot()} />);

  const planD = planDensity(data.events.length);
  planPages.forEach((page) =>
    pages.push(
      <PlanPage
        key={`plan-${page.index}`}
        data={data}
        number={slot()}
        events={page.items}
        density={planD}
        continued={page.continued}
      />,
    ),
  );

  const chargeD = chargeDensity(data.charges.length);
  chargePages.forEach((page) =>
    pages.push(
      <DeliverablesPage
        key={`deliverables-${page.index}`}
        data={data}
        number={slot()}
        charges={page.items}
        density={chargeD}
        continued={page.continued}
        isLast={page.isLast}
      />,
    ),
  );

  const addonD = addonDensity(data.services.length);
  addonPages.forEach((page) =>
    pages.push(
      <AddonsPage
        key={`addons-${page.index}`}
        data={data}
        number={slot()}
        services={page.services}
        density={addonD}
        continued={page.continued}
      />,
    ),
  );

  const timelineD = timelineDensity(data.timeline.length);
  timelinePages.forEach((page) =>
    pages.push(
      <TimelinePage
        key={`timeline-${page.index}`}
        data={data}
        number={slot()}
        rows={page.items}
        density={timelineD}
        continued={page.continued}
        isLast={page.isLast}
      />,
    ),
  );

  termPages.forEach((page) =>
    pages.push(
      <TermsPage
        key={`terms-${page.index}`}
        number={slot()}
        terms={page.items}
        continued={page.continued}
      />,
    ),
  );

  pages.push(<ContactPage key="contact" data={data} number={slot()} />);

  return <div className="quote-doc qstack">{pages}</div>;
}
