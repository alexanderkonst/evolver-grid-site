/** The "Map" view of /products: every visible product in one table (cards below xl). Data: src/data/productMap.ts. */
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_FAMILIES, PRODUCT_GROUPS, termsLines, visibleProducts, type ProductRow } from "@/data/productMap";
import "./productMapView.css";

const COLUMNS = ["Module", "Product", "For whom", "Shift", "Price · duration · format", "Page"] as const;

const Page = ({ row }: { row: ProductRow }) => {
  if (!row.landing) return null;
  const label = "Open page";
  return row.landing.external ? (
    <a href={row.landing.href} target="_blank" rel="noopener noreferrer" className="product-quiet-link">
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link to={row.landing.href} className="product-quiet-link">{label}</Link>
  );
};

const Terms = ({ row }: { row: ProductRow }) => (
  <div className="space-y-1">
    {termsLines(row).map(line => <p key={line}>{line}</p>)}
  </div>
);

const Name = ({ row }: { row: ProductRow }) => (
  <>
    {row.step && <span className="product-eyebrow block text-[11px]">Step {row.step}</span>}
    <span className="product-title text-lg block">{row.name}</span>
    {row.family && <span className="product-body text-xs italic block">{PRODUCT_FAMILIES[row.family].name}</span>}
  </>
);

const ProductMapView = () => {
  const groups = PRODUCT_GROUPS.map(group => ({ ...group, rows: visibleProducts(group.id) }));

  return (
    <div className="product-map space-y-8">
      {/* From xl: one table, three groups. */}
      <div className="hidden xl:block">
        <table className="product-body w-full text-left text-sm leading-snug border-collapse">
          <caption className="sr-only">Product map: every offer, price and format</caption>
          <thead>
            <tr className="pm-rule border-b">
              {COLUMNS.map(name => (
                <th key={name} scope="col" className="product-eyebrow py-3 pr-4 align-bottom font-bold">{name}</th>
              ))}
            </tr>
          </thead>
          {groups.map(group => (
            <Fragment key={group.id}>
              <tbody>
                <tr>
                  <th scope="colgroup" colSpan={COLUMNS.length} className="product-title text-2xl pt-10 pb-3">{group.title}</th>
                </tr>
                {group.rows.map(row => (
                  <tr key={row.id} className="pm-rule border-t align-top">
                    <td className="py-4 pr-4 w-[14%]">{row.module}</td>
                    <th scope="row" className="py-4 pr-4 w-[16%] font-normal"><Name row={row} /></th>
                    <td className="py-4 pr-4 w-[14%]">{row.forWhom}</td>
                    <td className="py-4 pr-4 w-[20%]">{row.shift}</td>
                    <td className="py-4 pr-4 w-[24%]"><Terms row={row} /></td>
                    <td className="py-4 w-[12%]"><Page row={row} /></td>
                  </tr>
                ))}
              </tbody>
            </Fragment>
          ))}
        </table>
      </div>

      {/* Below xl: one card per row. */}
      <div className="xl:hidden space-y-10 max-w-2xl mx-auto w-full">
        {groups.map(group => (
          <section key={group.id} className="space-y-4" aria-labelledby={`map-${group.id}`}>
            <h2 id={`map-${group.id}`} className="product-title text-2xl text-center">{group.title}</h2>
            {group.rows.map(row => (
              <article key={row.id} className="pm-card rounded-3xl p-5 space-y-3">
                <header className="space-y-1">
                  <Name row={row} />
                  <p className="product-body text-sm italic">{row.module}</p>
                </header>
                <dl className="product-body text-base space-y-2">
                  {row.forWhom && <div><dt className="product-eyebrow">{COLUMNS[2]}</dt><dd>{row.forWhom}</dd></div>}
                  {row.shift && <div><dt className="product-eyebrow">{COLUMNS[3]}</dt><dd>{row.shift}</dd></div>}
                  <div><dt className="product-eyebrow">{COLUMNS[4]}</dt><dd><Terms row={row} /></dd></div>
                  {row.landing && <div><dt className="product-eyebrow">{COLUMNS[5]}</dt><dd><Page row={row} /></dd></div>}
                </dl>
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

export { ProductMapView };
