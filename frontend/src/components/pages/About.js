import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              À propos de Reversee
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Découvrez comment Reversee est né et comment nous aidons les utilisateurs à visualiser leur futur personnel.
            </p>
          </div>
          <div className="mt-12 lg:mt-0 lg:col-span-2">
            <dl className="space-y-12">
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Notre mission
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Reversee a été créé avec une mission claire : aider les gens à comprendre comment leurs habitudes quotidiennes façonnent leur avenir. Nous croyons que la visualisation du futur peut motiver des changements positifs aujourd'hui.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Comment ça marche
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Notre plateforme utilise des algorithmes avancés pour projeter l'évolution de votre santé physique, mentale et émotionnelle en fonction de vos habitudes actuelles. En saisissant régulièrement des données sur votre sommeil, activité physique, temps d'écran et autres facteurs, nous créons une simulation personnalisée de votre futur.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Notre équipe
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Reversee est développé par une équipe passionnée d'experts en santé, en technologie et en science des données. Nous sommes dédiés à créer une expérience immersive qui inspire des changements positifs dans la vie de nos utilisateurs.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Prêt à voir votre futur?</span>
            <span className="block text-indigo-600">Commencez à utiliser Reversee dès aujourd'hui.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Créer un compte
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
