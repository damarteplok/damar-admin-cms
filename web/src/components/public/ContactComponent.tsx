'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Office {
  name: string
  address: string
}

interface EmailContact {
  department: string
  email: string
}

interface ContactComponentProps {
  heading?: string
  subheading?: string
  offices?: Office[]
  emailContacts?: EmailContact[]
  formHeading?: string
  formSubheading?: string
}

const defaultOffices: Office[] = [
  {
    name: 'California',
    address: '300 Market St, San Francisco, California 94105',
  },
  {
    name: 'Texas',
    address: '2101 Main St, Dallas, Texas 75201',
  },
  {
    name: 'Florida',
    address: '455 Ocean Dr, Miami Beach, Florida 33139',
  },
]

const defaultEmailContacts: EmailContact[] = [
  {
    department: 'Sales',
    email: 'sales@domain.com',
  },
  {
    department: 'Careers',
    email: 'careers@domain.com',
  },
]

export const ContactComponent = ({
  heading = 'Contact us',
  subheading = "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
  offices = defaultOffices,
  emailContacts = defaultEmailContacts,
  formHeading = 'Get in touch',
  formSubheading = 'Have a question or need help? Fill out the form below and our team will reach out to you shortly.',
}: ContactComponentProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {heading}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
            {subheading}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left Column - Office Locations & Email */}
          <div className="space-y-12">
            {/* Visit our offices */}
            <div>
              <h2 className="mb-6 text-xl font-semibold">Visit our offices</h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Reach out to us at any of our offices below. Our team is always ready to
                connect with you.
              </p>

              <div className="space-y-6">
                {offices.map((office, index) => (
                  <div key={index} className="border-border border-b pb-6 last:border-0">
                    <h3 className="mb-2 font-semibold">{office.name}</h3>
                    <p className="text-muted-foreground text-sm">{office.address}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Email us */}
            <div>
              <h2 className="mb-6 text-xl font-semibold">Email us</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Prefer email? Choose the department that best fits your needs and we'll
                get back to you soon.
              </p>

              <div className="space-y-4">
                {emailContacts.map((contact, index) => (
                  <div key={index}>
                    <h3 className="mb-1 font-semibold">{contact.department}</h3>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <div className="mb-8">
              <h2 className="mb-3 text-xl font-semibold">{formHeading}</h2>
              <p className="text-muted-foreground text-sm">{formSubheading}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name & Email */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="border-border"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company name
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="border-border"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="border-border resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Send message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
