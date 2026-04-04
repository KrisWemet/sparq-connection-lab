export default function DailyQuestionsRedirectPage() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/daily-growth',
      permanent: false,
    },
  };
}
