import { FooterCompany } from './FooterCompany';
import { FooterLinks } from './FooterLinks';
import { FooterNewsletter } from './FooterNewsletter';
import { FooterBottom } from './FooterBottom';
import { ScrollToTop } from './ScrollToTop';

export function Footer() {
  return (
    <>
      <footer
        className="font-poppins text-white"
        style={{ backgroundColor: '#0a2543', color: '#ffffff' }}
      >
        <div className="mx-auto py-12 px-8 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <FooterCompany />
            </div>
            <div className="lg:col-span-6">
              <FooterLinks />
            </div>
            <div className="lg:col-span-3">
              <FooterNewsletter />
            </div>
          </div>
        </div>
        <div className="h-px my-5 opacity-50" style={{ backgroundColor: '#0a2543' }} aria-hidden />
        <FooterBottom />
      </footer>
      <ScrollToTop />
    </>
  );
}
