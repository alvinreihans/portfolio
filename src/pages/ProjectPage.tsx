import { useParams } from 'react-router';

export function ProjectPage() {
  const { slug } = useParams();

  return <h1 className="font-display text-6xl leading-none">{slug}</h1>;
}
