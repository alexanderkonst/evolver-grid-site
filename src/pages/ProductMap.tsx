/** /products/map — public product map: one table of every offer. Data: src/data/productMap.ts. */
import { Fragment } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { ProductEyebrow, ProductHero, ProductLanding } from "@/components/products/ProductLanding";
import { Ornament } from "@/lib/landingDesign";
import "./ProductMap.css";
import { PRODUCT_MAP, type ProductMapLink, type ProductMapRow, type ProductMapTerms } from "@/data/productMap";

const TITLE = "Product map: every offer, price and format";
const DESCRIPTION =
  "One table of every offer: who it is for, the shift, price, duration and format, and where to find it.";

const COLUMNS = ["Module", "Product", "For whom", "Shift", "Price · duration · format", "Page"];

const termsLine = ({ price, duration, format }: ProductMapTerms) =>
  [price, duration, format].filter(Boolean).join(" · ");

const MapLink = ({ link }: { link: ProductMapLink }) =>
  link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className="product-quiet-link">
      {link.label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link to={link.href} className="product-quiet-link">{link.label}</Link>
  );

const Terms = ({ row }: { row: ProductMapRow }) => (
  <div className="space-y-1">
    {row.terms.map(terms => <p key={termsLine(terms)}>{termsLine(terms)}</p>)}
  </div>
);

const Links = ({ row }: { row: ProductMapRow }) =>
  row.links.length === 0 ? null : (
    <ul className="space-y-1">
      {row.links.map(link => <li key={link.href}><MapLink link={link} /></li>)}
    </ul>
  );

const ProductName = ({ row }: { row: ProductMapRow }) => (
  <>
    {row.step && <span className="product-eyebrow block text-[11px]">Step {row.step}</span>}
    <span className="product-title text-lg block">{row.product}</span>
  </>
);

/** Below xl: one card per row. */
const MobileCards = () => (
  <div className="xl:hidden space-y-10 max-w-2xl mx-auto w-full">
    {PRODUCT_MAP.map(group => (
      <section key={group.id} className="space-y-4" aria-labelledby={`map-m-${group.id}`}>
        <h2 id={`map-m-${group.id}`} className="product-title text-2xl text-center">{group.title}</h2>
        {group.rows.map(row => (
          <article key={row.id} className="pm-card rounded-3xl p-5 space-y-3">
            <header className="space-y-1">
              <ProductName row={row} />
              <p className="product-body text-sm italic">{row.module}</p>
            </header>
            <dl className="product-body text-base space-y-2">
              <div><dt className="product-eyebrow">For whom</dt><dd>{row.audience}</dd></div>
              <div><dt className="product-eyebrow">Shift</dt><dd>{row.shift}</dd></div>
              <div><dt className="product-eyebrow">Price · duration · format</dt><dd><Terms row={row} /></dd></div>
              {row.links.length > 0 && <div><dt className="product-eyebrow">Page</dt><dd><Links row={row} /></dd></div>}
            </dl>
          </article>
        ))}
      </section>
    ))}
  </div>
);

/** From xl: one table, three groups. The page widens its column in ProductMap.css. */
const DesktopTable = () => (
  <div className="hidden xl:block">
    <table className="product-body w-full text-left text-sm leading-snug border-collapse">
      <caption className="sr-only">{TITLE}</caption>
      <thead>
        <tr className="pm-rule border-b">
          {COLUMNS.map(name => (
            <th key={name} scope="col" className="product-eyebrow py-3 pr-4 align-bottom font-bold">{name}</th>
          ))}
        </tr>
      </thead>
      {PRODUCT_MAP.map(group => (
        <Fragment key={group.id}>
          <tbody>
            <tr>
              <th id={`map-d-${group.id}`} scope="colgroup" colSpan={COLUMNS.length} className="product-title text-2xl pt-10 pb-3">
                {group.title}
              </th>
            </tr>
            {group.rows.map(row => (
              <tr key={row.id} className="pm-rule border-t align-top">
                <td className="py-4 pr-4 w-[14%]">{row.module}</td>
                <th scope="row" className="py-4 pr-4 w-[16%] font-normal"><ProductName row={row} /></th>
                <td className="py-4 pr-4 w-[14%]">{row.audience}</td>
                <td className="py-4 pr-4 w-[20%]">{row.shift}</td>
                <td className="py-4 pr-4 w-[20%]"><Terms row={row} /></td>
                <td className="py-4 w-[16%]"><Links row={row} /></td>
              </tr>
            ))}
          </tbody>
        </Fragment>
      ))}
    </table>
  </div>
);

const ProductMap = () => (
  <>
    <SEO title={TITLE} description={DESCRIPTION} path="/products/map" />
    <ProductLanding>
      <div className="product-map space-y-12">
        <ProductHero
          eyebrow="Product map"
          title="Every offer, one table"
          subtitle="Who it is for, the shift, the price, and where to go."
        >
          <Ornament />
        </ProductHero>

        <DesktopTable />
        <MobileCards />

        <footer className="text-center pb-8">
          <ProductEyebrow>Find Your Top Talent</ProductEyebrow>
          <Ornament />
        </footer>
      </div>
    </ProductLanding>
  </>
);

export default ProductMap;
