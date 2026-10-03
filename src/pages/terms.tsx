import Head from 'next/head';
import Link from 'next/link';
import { ContactLine, LegalPage, LegalSection } from '@/components/legal/LegalPage';

/** Terms of use in plain words. Public page. */
export default function TermsPage() {
  return (
    <>
      <Head><title>Terms · Sparq</title></Head>
      <LegalPage
        eyebrow="Terms"
        title="Terms of use"
        intro={<p>These are the rules for using Sparq. By making an account, you agree to them.</p>}
      >
        <LegalSection title="What Sparq is, and isn't">
          <p>
            Sparq is a daily practice for people who want to grow, on their own and as a couple. It teaches through
            short stories, small real-life steps and conversations with Peter, an AI guide.
          </p>
          <ul>
            <li>Sparq isn&rsquo;t therapy, counselling or medical care, and doesn&rsquo;t replace them.</li>
            <li>Peter is an AI. He can be wrong, and his guesses about you are only guesses.</li>
            <li>Big choices about your life and relationship are always yours.</li>
          </ul>
        </LegalSection>

        <LegalSection title="If you're not safe">
          <p>
            Sparq isn&rsquo;t a crisis service and can&rsquo;t send help. If you or someone else is in danger, call
            your local emergency number. The <Link href="/help-now" className="font-semibold text-brand-primary underline">Help now</Link> page
            lists people you can reach right away. Sparq isn&rsquo;t meant for relationships where someone is being
            hurt or controlled.
          </p>
        </LegalSection>

        <LegalSection title="Your account">
          <ul>
            <li>You need to be 18 or older.</li>
            <li>Keep your password to yourself. You&rsquo;re responsible for what happens in your account.</li>
            <li>One account per person. Your partner makes their own and links to yours.</li>
          </ul>
        </LegalSection>

        <LegalSection title="Your words stay yours">
          <p>
            What you write belongs to you. You let us store and use it only to run Sparq for you: to show it back to
            you, to help Peter respond, and to share it with your partner when you choose to. See
            our <Link href="/privacy" className="font-semibold text-brand-primary underline">privacy page</Link> for details.
          </p>
        </LegalSection>

        <LegalSection title="Fair use">
          <p>Please don&rsquo;t:</p>
          <ul>
            <li>use Sparq to harm, threaten or watch another person, including a partner;</li>
            <li>try to get into someone else&rsquo;s account or data;</li>
            <li>break, overload or copy the app, or use it to train other AI.</li>
          </ul>
          <p>If someone does, we may close their account.</p>
        </LegalSection>

        <LegalSection title="Plans and payment">
          <p>
            Sparq has a free plan and paid plans (Solo and Together). Paid plans aren&rsquo;t charged yet. Before we
            start charging, we&rsquo;ll show you the price and ask you to agree first. Safety tools and your control
            over your own data are always free.
          </p>
        </LegalSection>

        <LegalSection title="Changes and ending">
          <ul>
            <li>Sparq is new. Features will change, and some may go away.</li>
            <li>You can delete your account any time from Settings.</li>
            <li>If we change these terms in a way that matters, we&rsquo;ll tell you in the app first.</li>
          </ul>
        </LegalSection>

        <LegalSection title="Limits">
          <p>
            We work hard to make Sparq helpful and safe, but we provide it as it is. As far as the law allows, we
            aren&rsquo;t responsible for decisions you make based on it, or for losses from the app being
            unavailable.
          </p>
          <ContactLine />
        </LegalSection>
      </LegalPage>
    </>
  );
}
