export default function DailyActivityRedirectPage() {
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
