'use client';
import Earth from '@/components/landing/Hero/earth/Earth';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

const Globe = () => {
	return (
		<section className="absolute inset-0 -z-1 translate-x-1/3">
			<Canvas
				style={{ height: '100vh' }}
				camera={{
					position: [0, 0, 1.5],
				}}>
				<Suspense fallback={null}>
					<Earth />
				</Suspense>
			</Canvas>
		</section>
	);
};

export default Globe;
