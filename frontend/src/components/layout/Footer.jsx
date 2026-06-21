import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-primary-dark text-white">
      <div className="kenya-stripe" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h4 className="font-heading font-bold text-accent">Laikipia County</h4>
          <p className="mt-2 text-sm text-white/70">
            Public Service Board — promoting merit-based recruitment for the County Government of Laikipia.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold">Contact</h4>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li>County Headquarters, Nanyuki</li>
            <li>Email: cpsb@laikipia.go.ke</li>
            <li>Phone: +254 700 000 000</li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold">Quick Links</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link to="/vacancies" className="text-white/70 hover:text-accent">Open Vacancies</Link></li>
            <li><Link to="/login" className="text-white/70 hover:text-accent">Applicant Login</Link></li>
            <li><a href="#" className="text-white/70 hover:text-accent">Recruitment Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} County Government of Laikipia. All rights reserved.
      </div>
    </footer>
  );
}
