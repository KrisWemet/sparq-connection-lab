import Head from 'next/head';
import Link from 'next/link';
import { ContactLine, LegalPage, LegalSection } from '@/components/legal/LegalPage';

/**
 * Privacy policy in plain words. Public page. Keep it true: every claim here
 * must match what the code does (export: /api/me/export, delete:
 * /api/me/delete-account, memory modes: Trust Center, sharing: constitution §8).
 */
export default function PrivacyPage() {
  return (
    <>
      <Head><title>Privacy · Sparq</title></Head>
      <LegalPage
        eyebrow="Privacy"
        title="Your privacy"
        intro={
          <p>
            What you write in Sparq is personal. This page says, in plain words, what we keep, why, who helps us
            run the app, and what you can do about it.
          </p>
        }
      >
        <LegalSection title="The short version">
          <ul>
            <li>Your answers and reflections are private. Your partner sees only what you choose to share.</li>
            <li>We don&rsquo;t sell your data, and we don&rsquo;t use it for ads.</li>
            <li>You can download everything we have about you, or delete it all, from Settings.</li>
          </ul>
        </LegalSection>

        <LegalSection title="What we keep">
          <ul>
            <li><strong>Your account:</strong> your email, name and, if you add one, your partner&rsquo;s name.</li>
            <li><strong>What you write:</strong> check-ins, daily reflections, journal entries, chats with Peter, and your answers in journeys.</li>
            <li><strong>What Peter remembers:</strong> short notes from your conversations, so he can pick up where you left off. Guesses he makes about you are shown on your Insight Profile, where you can correct them.</li>
            <li><strong>Your settings:</strong> reminder time, time zone and choices like memory length.</li>
            <li><strong>How you use the app:</strong> things like which day you&rsquo;re on and which screens you finish, so we can fix problems and make the app better.</li>
            <li><strong>Voice notes:</strong> if you talk instead of type, the recording is turned into text and the text is kept, not the recording.</li>
          </ul>
        </LegalSection>

        <LegalSection title="Your partner">
          <p>
            Linking with a partner doesn&rsquo;t open your private space to them. Each of you answers on your own.
            They see an answer only when you tap &ldquo;Share with partner&rdquo;. They don&rsquo;t see whether you
            did today&rsquo;s practice. If either of you unlinks, sharing stops.
          </p>
        </LegalSection>

        <LegalSection title="Who helps us run Sparq">
          <p>We use a few companies to run the app. They handle your data only to do that job for us.</p>
          <ul>
            <li><strong>Supabase:</strong> stores your account and data.</li>
            <li><strong>Vercel:</strong> hosts the app.</li>
            <li><strong>OpenRouter and Anthropic:</strong> write Peter&rsquo;s replies. What you send Peter is passed to them to write an answer.</li>
            <li><strong>OpenAI:</strong> turns voice notes into text, helps Peter find relevant memories, and suggests date ideas.</li>
            <li><strong>Apple, Google or Mozilla:</strong> deliver phone notifications if you turn them on. The message is encrypted on the way.</li>
            <li><strong>An email service:</strong> sends reminder emails, only if you turn them on.</li>
          </ul>
        </LegalSection>

        <LegalSection title="How long we keep it">
          <p>
            Peter&rsquo;s memory follows your choice in the <Link href="/trust-center" className="font-semibold text-brand-primary underline">Trust Center</Link>:
            off, the last 90 days, or until you delete it. Everything else stays while you have an account. When you
            delete your account, your data is erased right away. Backups held by our database provider may take a
            little longer to roll off.
          </p>
        </LegalSection>

        <LegalSection title="Your choices">
          <ul>
            <li><strong>See and fix:</strong> your Insight Profile shows Peter&rsquo;s guesses about you. Say &ldquo;not really&rdquo; to any of them.</li>
            <li><strong>Download:</strong> Settings → Download my data gives you a file with everything we keep about you.</li>
            <li><strong>Delete:</strong> Settings → Delete account erases your account and everything in it.</li>
            <li><strong>Reminders:</strong> off unless you turn them on, and you can turn them off any time. Every email has an unsubscribe link.</li>
          </ul>
        </LegalSection>

        <LegalSection title="Safety">
          <p>
            Sparq isn&rsquo;t a crisis service. If something you write suggests you or someone else may be in danger,
            Peter points you to people who can help right away. That check happens in the moment and isn&rsquo;t
            saved, and we don&rsquo;t contact anyone on your behalf. Help is always one tap away on the Help now page.
          </p>
        </LegalSection>

        <LegalSection title="Age">
          <p>Sparq is for adults 18 and over.</p>
        </LegalSection>

        <LegalSection title="Changes and questions">
          <p>If we change this page in a way that matters, we&rsquo;ll tell you in the app before it takes effect.</p>
          <ContactLine />
        </LegalSection>
      </LegalPage>
    </>
  );
}
