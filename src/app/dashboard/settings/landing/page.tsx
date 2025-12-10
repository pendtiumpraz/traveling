"use client";

import { useState, useEffect } from "react";
import { Button, Input, Card } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { Save, Eye, Plus, Trash2, Image as ImageIcon } from "lucide-react";

interface LandingContent {
  hero: {
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    image: string;
  };
  stats: Array<{ value: string; label: string }>;
  features: Array<{ icon: string; title: string; description: string }>;
  packages: { title: string; subtitle: string };
  testimonials: {
    title: string;
    subtitle: string;
    items: Array<{
      name: string;
      location: string;
      image: string;
      text: string;
      rating: number;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
    image: string;
  };
  gallery: string[];
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
  };
  footer: {
    copyright: string;
    tagline: string;
  };
}

export default function LandingSettingsPage() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const { success, error } = useToast();

  useEffect(() => {
    fetch("/api/settings/landing")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setContent(json.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const json = await res.json();
      if (json.success) {
        success("Saved!", "Landing page updated successfully");
      } else {
        error("Error", json.message);
      }
    } catch (err) {
      error("Error", "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = (path: string, value: unknown) => {
    if (!content) return;
    const keys = path.split(".");
    const newContent = { ...content };
    let obj: Record<string, unknown> = newContent;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
    setContent(newContent as LandingContent);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">Loading...</div>
    );
  }

  if (!content) {
    return (
      <div className="flex h-96 items-center justify-center">
        Failed to load content
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "Hero" },
    { id: "stats", label: "Stats" },
    { id: "features", label: "Features" },
    { id: "testimonials", label: "Testimonials" },
    { id: "gallery", label: "Gallery" },
    { id: "cta", label: "CTA" },
    { id: "contact", label: "Contact" },
    { id: "footer", label: "Footer" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Landing Page Settings
          </h1>
          <p className="text-gray-500">Customize your public landing page</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.open("/", "_blank")}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Tab */}
      {activeTab === "hero" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Hero Section</h3>
          <Input
            label="Title"
            value={content.hero.title}
            onChange={(e) => updateContent("hero.title", e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Subtitle
            </label>
            <textarea
              value={content.hero.subtitle}
              onChange={(e) => updateContent("hero.subtitle", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CTA Button 1"
              value={content.hero.cta1}
              onChange={(e) => updateContent("hero.cta1", e.target.value)}
            />
            <Input
              label="CTA Button 2"
              value={content.hero.cta2}
              onChange={(e) => updateContent("hero.cta2", e.target.value)}
            />
          </div>
          <Input
            label="Background Image URL"
            value={content.hero.image}
            onChange={(e) => updateContent("hero.image", e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
          {content.hero.image && (
            <img
              src={content.hero.image}
              alt="Preview"
              className="h-40 w-full rounded-lg object-cover"
            />
          )}
        </Card>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Statistics</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newStats = [
                  ...content.stats,
                  { value: "0", label: "New Stat" },
                ];
                updateContent("stats", newStats);
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Stat
            </Button>
          </div>
          {content.stats.map((stat, i) => (
            <div key={i} className="flex items-end gap-4">
              <Input
                label="Value"
                value={stat.value}
                onChange={(e) => {
                  const newStats = [...content.stats];
                  newStats[i].value = e.target.value;
                  updateContent("stats", newStats);
                }}
                className="flex-1"
              />
              <Input
                label="Label"
                value={stat.label}
                onChange={(e) => {
                  const newStats = [...content.stats];
                  newStats[i].label = e.target.value;
                  updateContent("stats", newStats);
                }}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => {
                  const newStats = content.stats.filter((_, idx) => idx !== i);
                  updateContent("stats", newStats);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </Card>
      )}

      {/* Features Tab */}
      {activeTab === "features" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Features</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newFeatures = [
                  ...content.features,
                  {
                    icon: "Shield",
                    title: "New Feature",
                    description: "Description",
                  },
                ];
                updateContent("features", newFeatures);
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Feature
            </Button>
          </div>
          {content.features.map((feature, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Feature {i + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => {
                    const newFeatures = content.features.filter(
                      (_, idx) => idx !== i,
                    );
                    updateContent("features", newFeatures);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Icon (Shield, Users, Hotel, Plane, HeartHandshake, MapPin)"
                  value={feature.icon}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[i].icon = e.target.value;
                    updateContent("features", newFeatures);
                  }}
                />
                <Input
                  label="Title"
                  value={feature.title}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[i].title = e.target.value;
                    updateContent("features", newFeatures);
                  }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={feature.description}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[i].description = e.target.value;
                    updateContent("features", newFeatures);
                  }}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Gallery Tab */}
      {activeTab === "gallery" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Gallery Images</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newGallery = [
                  ...content.gallery,
                  "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80",
                ];
                updateContent("gallery", newGallery);
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Image
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {content.gallery.map((img, i) => (
              <div key={i} className="space-y-2">
                <div className="relative">
                  <img
                    src={img}
                    alt={`Gallery ${i}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 text-red-500"
                    onClick={() => {
                      const newGallery = content.gallery.filter(
                        (_, idx) => idx !== i,
                      );
                      updateContent("gallery", newGallery);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={img}
                  onChange={(e) => {
                    const newGallery = [...content.gallery];
                    newGallery[i] = e.target.value;
                    updateContent("gallery", newGallery);
                  }}
                  placeholder="Image URL"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={content.contact.phone}
              onChange={(e) => updateContent("contact.phone", e.target.value)}
            />
            <Input
              label="Email"
              value={content.contact.email}
              onChange={(e) => updateContent("contact.email", e.target.value)}
            />
            <Input
              label="WhatsApp (without +)"
              value={content.contact.whatsapp}
              onChange={(e) =>
                updateContent("contact.whatsapp", e.target.value)
              }
            />
            <Input
              label="Address"
              value={content.contact.address}
              onChange={(e) => updateContent("contact.address", e.target.value)}
            />
          </div>
        </Card>
      )}

      {/* CTA Tab */}
      {activeTab === "cta" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">
            Call to Action Section
          </h3>
          <Input
            label="Title"
            value={content.cta.title}
            onChange={(e) => updateContent("cta.title", e.target.value)}
          />
          <Input
            label="Subtitle"
            value={content.cta.subtitle}
            onChange={(e) => updateContent("cta.subtitle", e.target.value)}
          />
          <Input
            label="Button Text"
            value={content.cta.button}
            onChange={(e) => updateContent("cta.button", e.target.value)}
          />
          <Input
            label="Background Image URL"
            value={content.cta.image}
            onChange={(e) => updateContent("cta.image", e.target.value)}
          />
        </Card>
      )}

      {/* Footer Tab */}
      {activeTab === "footer" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Footer</h3>
          <Input
            label="Copyright Text"
            value={content.footer.copyright}
            onChange={(e) => updateContent("footer.copyright", e.target.value)}
          />
          <Input
            label="Tagline"
            value={content.footer.tagline}
            onChange={(e) => updateContent("footer.tagline", e.target.value)}
          />
        </Card>
      )}

      {/* Testimonials Tab */}
      {activeTab === "testimonials" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Testimonials</h3>
          <Input
            label="Section Title"
            value={content.testimonials.title}
            onChange={(e) =>
              updateContent("testimonials.title", e.target.value)
            }
          />
          <Input
            label="Section Subtitle"
            value={content.testimonials.subtitle}
            onChange={(e) =>
              updateContent("testimonials.subtitle", e.target.value)
            }
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm font-medium">Testimonial Items</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newItems = [
                  ...content.testimonials.items,
                  {
                    name: "New Person",
                    location: "City",
                    image:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
                    text: "Testimonial text...",
                    rating: 5,
                  },
                ];
                updateContent("testimonials.items", newItems);
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
          {content.testimonials.items.map((item, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Testimonial {i + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => {
                    const newItems = content.testimonials.items.filter(
                      (_, idx) => idx !== i,
                    );
                    updateContent("testimonials.items", newItems);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Name"
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...content.testimonials.items];
                    newItems[i].name = e.target.value;
                    updateContent("testimonials.items", newItems);
                  }}
                />
                <Input
                  label="Location"
                  value={item.location}
                  onChange={(e) => {
                    const newItems = [...content.testimonials.items];
                    newItems[i].location = e.target.value;
                    updateContent("testimonials.items", newItems);
                  }}
                />
                <Input
                  label="Rating (1-5)"
                  type="number"
                  min={1}
                  max={5}
                  value={item.rating}
                  onChange={(e) => {
                    const newItems = [...content.testimonials.items];
                    newItems[i].rating = parseInt(e.target.value) || 5;
                    updateContent("testimonials.items", newItems);
                  }}
                />
              </div>
              <Input
                label="Image URL"
                value={item.image}
                onChange={(e) => {
                  const newItems = [...content.testimonials.items];
                  newItems[i].image = e.target.value;
                  updateContent("testimonials.items", newItems);
                }}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Testimonial Text
                </label>
                <textarea
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...content.testimonials.items];
                    newItems[i].text = e.target.value;
                    updateContent("testimonials.items", newItems);
                  }}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
