export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-end justify-end space-y-4 text-right">
          <div className="text-2xl font-bold text-white">
            INGREDIA
          </div>

          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} INGREDIA. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
