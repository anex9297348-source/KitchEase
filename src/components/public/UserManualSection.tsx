import React, { useState } from 'react';
import {
  BookOpen,
  Info,
  Droplets,
  Wind,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export const UserManualSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'fill' | 'spray' | 'pour' | 'cleaning' | 'care' | 'notes'
  >('overview');

  const manualSections = [
    {
      id: 'overview',
      label: 'Product Overview',
      icon: Info,
      title: 'KitchEase 2-in-1 Dispenser & Sprayer Overview',
      description:
        'Engineered for home cooks seeking cleaner culinary control. KitchEase combines a precision pouring valve with a pneumatic micro-atomizer inside one thermal borosilicate glass carafe.',
      image: '/images/hero.jpg',
      alt: 'KitchEase product overview anatomy',
      points: [
        { title: 'Carafe Material', text: 'Thermal shock-resistant high borosilicate glass (capacity: 470ml / 16 oz).' },
        { title: 'Dispenser Head', text: 'Food-grade BPA-free polypropylene with dual internal gravity and pump channels.' },
        { title: 'Atomizing Nozzle', text: 'Precision micro-orifice engineered for uniform misting without chemical propellants.' },
        { title: 'Ergonomic Lever', text: 'Single-hand thumb depression lever delivering consistent mechanical compression.' },
      ],
    },
    {
      id: 'fill',
      label: 'How to Fill',
      icon: Droplets,
      title: 'How to Fill the Dispenser',
      description:
        'Refilling your KitchEase bottle is quick, mess-free, and requires no funnel thanks to the generous wide-mouth carafe opening.',
      image: '/images/pour.jpg',
      alt: 'How to fill KitchEase oil bottle',
      points: [
        { title: 'Step 1: Twist Open', text: 'Firmly grasp the glass base and twist the top lid counter-clockwise to remove the pump head.' },
        { title: 'Step 2: Add Oil', text: 'Pour your favorite cooking oil directly into the wide opening. Fill up to 470ml (leave ~1 inch of headspace at the top for ideal pressure).' },
        { title: 'Step 3: Seal Securely', text: 'Align the lid threads and rotate clockwise until snug. Check that the silicone gasket is seated flush to prevent any drips.' },
      ],
    },
    {
      id: 'spray',
      label: 'How to Spray',
      icon: Wind,
      title: 'How to Spray a Fine Uniform Mist',
      description:
        'KitchEase uses a purely mechanical pneumatic compression pump to atomize oil into a wide, uniform cloud without aerosols or gases.',
      image: '/images/oil_spray_action_1788685889614.jpg',
      alt: 'Spraying mist with KitchEase',
      points: [
        { title: 'Decisive Press', text: 'Press the top lever with a quick, firm motion straight down. A fast press generates maximum pneumatic atomization.' },
        { title: 'Optimal Distance', text: 'Hold the nozzle roughly 6 to 10 inches away from your skillet, air fryer basket, or salad bowl for even, broad coverage.' },
        { title: 'First-Time Priming', text: 'When first filling or refilling after cleaning, press 2-3 times to prime the suction tube with oil.' },
      ],
    },
    {
      id: 'pour',
      label: 'How to Pour',
      icon: Droplets,
      title: 'How to Pour with Precision',
      description:
        'When you need a measured tablespoon or drizzle for searing, sautéing, or dressings, KitchEase pours smoothly without requiring cap removal.',
      image: '/images/oil_pour_action_1788685906571.jpg',
      alt: 'Pouring oil with KitchEase',
      points: [
        { title: 'Simple Tilt', text: 'Tilt the bottle forward over your pan. The gravity-assisted valve automatically opens to let oil flow steadily.' },
        { title: 'Flow Rate Control', text: 'A slight tilt produces a slow drizzle for salads; a deeper tilt provides a continuous pour for pan cooking.' },
        { title: 'Anti-Drip Lip', text: 'Return the bottle upright. The curved pouring lip draws back remaining oil, keeping the glass neck clean.' },
      ],
    },
    {
      id: 'cleaning',
      label: 'Cleaning Instructions',
      icon: Sparkles,
      title: 'Cleaning Instructions',
      description:
        'Regular cleaning ensures the nozzle sprays evenly and prevents oil oxidation. All components disassemble in seconds.',
      image: '/images/accessories.jpg',
      alt: 'Cleaning KitchEase dispenser and brushes',
      points: [
        { title: 'Disassemble', text: 'Unscrew the top pump lid from the glass bottle and remove the silicone tube.' },
        { title: 'Wash Glass Carafe', text: 'Fill the glass bottle with warm water and a drop of dish soap. Use the included long-neck bottle brush to scrub the interior.' },
        { title: 'Flush the Pump', text: 'Fill the bottle halfway with warm soapy water, screw on the lid, and pump 4–5 times into the sink to flush the internal nozzle.' },
        { title: 'Rinse & Dry', text: 'Rinse all parts thoroughly with clean water. Allow to air dry completely before refilling with fresh oil.' },
      ],
    },
    {
      id: 'care',
      label: 'Basic Care',
      icon: ShieldCheck,
      title: 'Basic Care & Maintenance',
      description:
        'Simple everyday habits to keep your KitchEase dispenser performing like new for years to come.',
      image: '/images/kitchen.jpg',
      alt: 'Kitchen countertop care for KitchEase',
      points: [
        { title: 'Dishwasher Guidance', text: 'The borosilicate glass bottle is top-rack dishwasher safe (up to 65°C / 150°F). Hand washing the mechanical pump head is recommended.' },
        { title: 'Countertop Placement', text: 'Store on a flat surface away from direct open flames or hot heating elements.' },
        { title: 'Nozzle Maintenance', text: 'If oil mist becomes uneven over time, run warm water through the pump to clear micro-residues.' },
        { title: 'Handling', text: 'Although borosilicate glass is durable and thermal-shock resistant, avoid dropping onto hard stone or tile flooring.' },
      ],
    },
    {
      id: 'notes',
      label: 'Important Usage Notes',
      icon: AlertTriangle,
      title: 'Important Usage Notes & Guidelines',
      description:
        'Essential do’s and don’ts to ensure optimal performance, hygiene, and kitchen safety.',
      image: '/images/accessories.jpg',
      alt: 'Important usage notes',
      points: [
        { title: 'Pure Oils Only', text: 'Use pure cooking oils (olive, avocado, canola, vegetable, sunflower, sesame). Do not use oils containing whole garlic pieces, rosemary sprigs, or chili flakes that can clog the nozzle.' },
        { title: 'No Syrups or Viscous Liquids', text: 'Do not use for thick honey, molasses, or sugary syrups as they will gum the mechanical pump valve.' },
        { title: 'Room Temperature', text: 'For best atomization, use oils at comfortable room temperature (65°F–75°F / 18°C–24°C). Cold oils become viscous and may spray as a stream.' },
        { title: 'Do Not Microwave', text: 'Do not place the bottle or pump lid inside a microwave or conventional oven.' },
      ],
    },
  ];

  const currentSection = manualSections.find((s) => s.id === activeTab) || manualSections[0];

  return (
    <section id="user-manual" className="py-16 sm:py-24 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#2A4B3C]" />
            <span>Official Guide &amp; Instructions</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
            KitchEase User Manual
          </h2>
          <p className="mt-3 text-stone-600 text-base font-light">
            Clear, step-by-step instructions paired with product visuals to help you get the best from your dispenser.
          </p>
        </div>

        {/* Section Tab Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          {manualSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2A4B3C] text-white shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Manual Content Display Card */}
        <div className="rounded-3xl bg-[#FAF8F5] border border-stone-200 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Product Picture */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-stone-200/80 p-4 shadow-sm flex items-center justify-center">
                <img
                  src={currentSection.image}
                  alt={currentSection.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-3 left-4 bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {currentSection.label}
                </span>
              </div>
            </div>

            {/* Right: Instructions & Clear Bullet Points */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#2A4B3C]">
                  Manual Section: {currentSection.label}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-normal text-stone-900 mt-1">
                  {currentSection.title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mt-2 font-light">
                  {currentSection.description}
                </p>
              </div>

              {/* Point-by-point details */}
              <div className="space-y-3 pt-2">
                {currentSection.points.map((pt, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-stone-200/80 text-xs sm:text-sm">
                    <strong className="text-stone-900 block font-semibold mb-0.5">
                      {pt.title}
                    </strong>
                    <span className="text-stone-600 font-light leading-relaxed">
                      {pt.text}
                    </span>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

        {/* Quick DO's and DON'Ts Summary Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {/* DO's */}
          <div className="rounded-2xl bg-emerald-50/50 border border-emerald-200 p-6">
            <h4 className="font-display text-lg font-normal text-emerald-950 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Recommended Practices (Do's)</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-900/80">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>Use standard culinary cooking oils at room temperature for optimal spray atomization.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>Press the spray lever with a firm, brisk motion to create the finest mist cloud.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>Rinse and flush with warm soapy water periodically to keep the nozzle clean.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>Ensure the silicone seal sits flat when closing to prevent any seepage.</span>
              </li>
            </ul>
          </div>

          {/* DON'Ts */}
          <div className="rounded-2xl bg-amber-50/50 border border-amber-200 p-6">
            <h4 className="font-display text-lg font-normal text-amber-950 flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-amber-700" />
              <span>Things to Avoid (Don'ts)</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-amber-900/80">
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>Do not fill with unfiltered oils with herbs or garlic sediment that can clog the nozzle.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>Do not place the bottle or lid into microwaves or directly over open stovetop flames.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>Do not force the pump lever if the nozzle is temporarily obstructed—flush with warm water instead.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>Do not freeze liquids inside the glass bottle or use abrasive scouring pads on the glass.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
};
