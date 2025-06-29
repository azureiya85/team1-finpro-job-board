import { Building, Mail, MapPin, Rocket, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for team members - create dummy avatar images in your /public folder if you wish
const teamMembers = [
  { name: 'Budi Santoso', role: 'CEO & Founder', avatar: '/avatars/male-1.png' },
  { name: 'Citra Lestari', role: 'Head of Product', avatar: '/avatars/female-1.png' },
  { name: 'Agung Wicaksono', role: 'Lead Engineer', avatar: '/avatars/male-2.png' },
];

export default function AboutPage() {
  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
            About Work Vault
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering Indonesian professionals and businesses to build a brighter future, together.
          </p>
        </header>

        <main className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Our Mission */}
            <Card className="col-span-1 md:col-span-2 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Rocket className="h-6 w-6 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>
                  Our mission at Work Vault is to bridge the gap between talented Indonesian job seekers and the nation&apos;s most innovative companies. We believe that the right job can transform a person&#39;s life and that the right person can transform a business. We are dedicated to creating a transparent, efficient, and accessible job market for everyone across the archipelago.
                </p>
              </CardContent>
            </Card>

            {/* Our Story */}
            <Card className="shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Building className="h-6 w-6 text-primary" />
                  Our Story
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>
                  Founded in 2023 in the heart of Jakarta, Work Vault was born from a simple observation: finding a meaningful career in Indonesia&apos;s fast-growing digital economy was still a challenge. We saw a need for a platform that was more than just a list of vacancies—a platform that truly understood the nuances of the local job market.
                </p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Mail className="h-6 w-6 text-primary" />
                  Get In Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Our Office</h4>
                    <p className="text-muted-foreground text-sm">Gedung Cyber 2 Tower, 18th Floor<br/>Jl. H.R. Rasuna Said, Kuningan, Jakarta Selatan, 12920</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Email Us</h4>
                    <a href="mailto:support@Work Vault.com" className="text-primary hover:underline text-sm">support@Work Vault.com</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meet Our Team Section */}
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center justify-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Meet Our Team
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">The passionate individuals behind Work Vault.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.name} className="text-center shadow-sm hover:shadow-lg transition-shadow border-border/50">
                  <CardContent className="pt-8 flex flex-col items-center">
                    <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-2xl bg-muted font-semibold">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}